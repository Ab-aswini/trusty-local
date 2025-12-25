import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AITextHelperProps {
  context: 'description' | 'story' | 'review';
  currentText: string;
  onTextGenerated: (text: string) => void;
  productName?: string;
  shopName?: string;
  placeholder?: string;
}

const prompts = {
  description: (productName: string, currentText: string) => 
    `Generate a brief, engaging product description (max 100 words) for "${productName}". ${currentText ? `Current draft: "${currentText}". Improve it.` : 'Make it appealing to customers.'}`,
  story: (shopName: string, currentText: string) => 
    `Write a compelling shop story (max 150 words) for "${shopName}". ${currentText ? `Current draft: "${currentText}". Enhance it.` : 'Make it personal and trustworthy.'}`,
  review: (currentText: string) => 
    `Help improve this customer review to be more descriptive and helpful (max 100 words). ${currentText ? `Current: "${currentText}"` : 'Write a positive, genuine-sounding review.'}`
};

export default function AITextHelper({
  context,
  currentText,
  onTextGenerated,
  productName = 'this product',
  shopName = 'this shop',
}: AITextHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateText = async () => {
    setIsGenerating(true);
    try {
      let prompt = '';
      if (context === 'description') {
        prompt = prompts.description(productName, currentText);
      } else if (context === 'story') {
        prompt = prompts.story(shopName, currentText);
      } else {
        prompt = prompts.review(currentText);
      }

      const { data, error } = await supabase.functions.invoke('ai-text-helper', {
        body: { prompt, context }
      });

      if (error) throw error;

      if (data?.text) {
        onTextGenerated(data.text);
        toast({ title: 'Text generated!', description: 'Feel free to edit it.' });
      }
    } catch (error) {
      console.error('AI text generation error:', error);
      toast({ 
        title: 'Generation failed', 
        description: 'Please try again later.',
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={generateText}
      disabled={isGenerating}
      className="h-7 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
    >
      {isGenerating ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Sparkles className="h-3 w-3 mr-1" />
      )}
      {isGenerating ? 'Writing...' : 'AI Help'}
    </Button>
  );
}
