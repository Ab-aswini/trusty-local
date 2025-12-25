import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BulkProductImportProps {
  shopId: string;
  onImportComplete: () => void;
}

interface ParsedProduct {
  name: string;
  description?: string;
  price_type: 'fixed' | 'range' | 'discount' | 'enquiry';
  price_fixed?: number;
  price_min?: number;
  price_max?: number;
  price_original?: number;
  price_discounted?: number;
  isValid: boolean;
  error?: string;
}

const BulkProductImport = ({ shopId, onImportComplete }: BulkProductImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let data: any[][] = [];
      
      if (ext === 'csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      } else {
        toast({ title: "Unsupported file format", description: "Please use CSV or Excel files", variant: "destructive" });
        return;
      }

      const products = parseRows(data);
      setParsedProducts(products);
      setFileName(file.name);
      setIsOpen(true);
    } catch (err: any) {
      toast({ title: "Failed to parse file", description: err.message, variant: "destructive" });
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const parseRows = (data: any[][]): ParsedProduct[] => {
    if (data.length < 2) return [];

    const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
    const nameIdx = headers.findIndex((h: string) => h === 'name' || h === 'product name' || h === 'product');
    const descIdx = headers.findIndex((h: string) => h === 'description' || h === 'desc');
    const priceIdx = headers.findIndex((h: string) => h === 'price' || h === 'mrp' || h === 'rate');
    const priceTypeIdx = headers.findIndex((h: string) => h === 'price type' || h === 'pricing');
    const minPriceIdx = headers.findIndex((h: string) => h === 'min price' || h === 'price min');
    const maxPriceIdx = headers.findIndex((h: string) => h === 'max price' || h === 'price max');
    const originalIdx = headers.findIndex((h: string) => h === 'original price' || h === 'original');
    const discountedIdx = headers.findIndex((h: string) => h === 'discounted price' || h === 'sale price' || h === 'discounted');

    return data.slice(1).map((row, idx) => {
      const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
      const description = descIdx >= 0 ? String(row[descIdx] || '').trim() : undefined;
      const priceTypeRaw = priceTypeIdx >= 0 ? String(row[priceTypeIdx] || '').toLowerCase().trim() : '';
      
      let price_type: 'fixed' | 'range' | 'discount' | 'enquiry' = 'enquiry';
      if (priceTypeRaw === 'fixed' || priceTypeRaw === 'mrp') price_type = 'fixed';
      else if (priceTypeRaw === 'range') price_type = 'range';
      else if (priceTypeRaw === 'discount' || priceTypeRaw === 'sale') price_type = 'discount';
      else if (priceIdx >= 0 && row[priceIdx]) price_type = 'fixed';

      const price_fixed = priceIdx >= 0 ? parseNumber(row[priceIdx]) : undefined;
      const price_min = minPriceIdx >= 0 ? parseNumber(row[minPriceIdx]) : undefined;
      const price_max = maxPriceIdx >= 0 ? parseNumber(row[maxPriceIdx]) : undefined;
      const price_original = originalIdx >= 0 ? parseNumber(row[originalIdx]) : undefined;
      const price_discounted = discountedIdx >= 0 ? parseNumber(row[discountedIdx]) : undefined;

      let isValid = true;
      let error: string | undefined;

      if (!name || name.length < 1) {
        isValid = false;
        error = 'Name is required';
      } else if (name.length > 200) {
        isValid = false;
        error = 'Name too long (max 200 chars)';
      }

      return {
        name,
        description: description?.slice(0, 500),
        price_type,
        price_fixed,
        price_min,
        price_max,
        price_original,
        price_discounted,
        isValid,
        error
      };
    }).filter(p => p.name); // Filter out empty rows
  };

  const parseNumber = (val: any): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = parseFloat(String(val).replace(/[₹$,]/g, ''));
    return isNaN(num) ? undefined : num;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    const validProducts = parsedProducts.filter(p => p.isValid);
    if (validProducts.length === 0) {
      toast({ title: "No valid products to import", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      const productsToInsert = validProducts.map(p => ({
        shop_id: shopId,
        name: p.name,
        description: p.description || null,
        price_type: p.price_type,
        price_fixed: p.price_fixed || null,
        price_min: p.price_min || null,
        price_max: p.price_max || null,
        price_original: p.price_original || null,
        price_discounted: p.price_discounted || null,
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      toast({ title: `${validProducts.length} products imported!` });
      setIsOpen(false);
      setParsedProducts([]);
      onImportComplete();
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const invalidCount = parsedProducts.filter(p => !p.isValid).length;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg mx-4 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Products
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="text-sm text-muted-foreground">
              File: <span className="font-medium text-foreground">{fileName}</span>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-green-600">
                <Check className="h-4 w-4" />
                {validCount} valid
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <X className="h-4 w-4" />
                  {invalidCount} errors
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-2 space-y-1">
                {parsedProducts.map((product, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg text-sm flex items-start gap-2 ${
                      product.isValid ? 'bg-muted/50' : 'bg-destructive/10'
                    }`}
                  >
                    {product.isValid ? (
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name || '(empty)'}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.isValid ? (
                          product.price_type === 'fixed' ? `₹${product.price_fixed}` :
                          product.price_type === 'range' ? `₹${product.price_min} - ₹${product.price_max}` :
                          product.price_type === 'discount' ? `₹${product.price_discounted}` : 'Enquire'
                        ) : product.error}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">Expected columns:</p>
              <p>Name (required), Description, Price, Price Type (fixed/range/discount/enquiry), Min Price, Max Price, Original Price, Discounted Price</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleImport} disabled={isImporting || validCount === 0}>
                {isImporting ? 'Importing...' : `Import ${validCount} Products`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkProductImport;
