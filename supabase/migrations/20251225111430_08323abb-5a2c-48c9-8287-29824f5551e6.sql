-- Create function to send email notification via edge function
CREATE OR REPLACE FUNCTION public.notify_shop_status_change()
RETURNS TRIGGER AS $$
DECLARE
  owner_email TEXT;
  shop_name TEXT;
BEGIN
  -- Only proceed if vendor_status changed
  IF OLD.vendor_status = NEW.vendor_status THEN
    RETURN NEW;
  END IF;

  -- Get owner email from auth.users
  SELECT email INTO owner_email FROM auth.users WHERE id = NEW.owner_id;
  
  IF owner_email IS NULL THEN
    RETURN NEW;
  END IF;

  shop_name := NEW.name;

  -- Send notification for approved or rejected status
  IF NEW.vendor_status = 'approved' THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
      ),
      body := jsonb_build_object(
        'type', 'shop_approved',
        'to', owner_email,
        'shopName', shop_name
      )
    );
  ELSIF NEW.vendor_status = 'rejected' THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
      ),
      body := jsonb_build_object(
        'type', 'shop_rejected',
        'to', owner_email,
        'shopName', shop_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to send email on new rating
CREATE OR REPLACE FUNCTION public.notify_new_rating()
RETURNS TRIGGER AS $$
DECLARE
  owner_email TEXT;
  shop_name TEXT;
  shop_owner_id UUID;
BEGIN
  -- Get shop details
  SELECT name, owner_id INTO shop_name, shop_owner_id FROM public.shops WHERE id = NEW.shop_id;
  
  -- Get owner email
  SELECT email INTO owner_email FROM auth.users WHERE id = shop_owner_id;
  
  IF owner_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Send notification
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'type', 'new_rating',
      'to', owner_email,
      'shopName', shop_name,
      'ratingDetails', jsonb_build_object(
        'isHelpful', NEW.is_helpful,
        'isHonest', NEW.is_honest,
        'isRespectful', NEW.is_respectful,
        'isCalm', NEW.is_calm
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS on_shop_status_change ON public.shops;
CREATE TRIGGER on_shop_status_change
  AFTER UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_shop_status_change();

DROP TRIGGER IF EXISTS on_new_rating ON public.ratings;
CREATE TRIGGER on_new_rating
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_rating();