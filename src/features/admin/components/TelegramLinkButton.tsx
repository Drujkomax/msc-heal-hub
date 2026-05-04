import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Copy, Check } from 'lucide-react';

interface TelegramLinkButtonProps {
  userId: string;
  hasTelegram?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
}

const TelegramLinkButton = ({ userId, hasTelegram = false, variant = 'outline', size = 'sm' }: TelegramLinkButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('generate_telegram_link_code', {
        target_user_id: userId,
      });
      if (error) throw error;
      setCode(data as string);
      setOpen(true);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Не удалось сгенерировать код',
        description: err instanceof Error ? err.message : 'Попробуйте ещё раз',
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {hasTelegram ? 'Перепривязать Telegram' : 'Привязать Telegram'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Код привязки Telegram</DialogTitle>
            <DialogDescription>
              Откройте бота, нажмите Start и пришлите этот код. Действителен 15 минут.
            </DialogDescription>
          </DialogHeader>

          {code && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="text-4xl font-mono font-bold tracking-widest bg-muted px-6 py-4 rounded-lg">
                {code}
              </div>
              <Button onClick={copy} variant="outline" size="sm">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TelegramLinkButton;
