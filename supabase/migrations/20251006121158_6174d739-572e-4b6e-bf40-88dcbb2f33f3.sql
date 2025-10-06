-- Create storage bucket for deal documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('deal-documents', 'deal-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for deal documents
CREATE TABLE IF NOT EXISTS public.deal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_documents
CREATE POLICY "Accountants and managers can view deal documents"
ON public.deal_documents
FOR SELECT
USING (
  has_role(auth.uid(), 'accountant'::app_role) 
  OR has_role_level(auth.uid(), 'sales_manager'::app_role)
);

CREATE POLICY "Accountants can upload deal documents"
ON public.deal_documents
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'accountant'::app_role)
  AND auth.uid() = uploaded_by
);

CREATE POLICY "Accountants can delete their deal documents"
ON public.deal_documents
FOR DELETE
USING (
  has_role(auth.uid(), 'accountant'::app_role)
  AND auth.uid() = uploaded_by
);

-- Storage policies for deal-documents bucket
CREATE POLICY "Accountants and managers can view deal documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'deal-documents'
  AND (
    has_role(auth.uid(), 'accountant'::app_role)
    OR has_role_level(auth.uid(), 'sales_manager'::app_role)
  )
);

CREATE POLICY "Accountants can upload deal documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'deal-documents'
  AND has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "Accountants can delete their deal documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'deal-documents'
  AND has_role(auth.uid(), 'accountant'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_deal_documents_updated_at
BEFORE UPDATE ON public.deal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();