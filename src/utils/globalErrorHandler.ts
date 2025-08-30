import { supabase } from '@/integrations/supabase/client';

// Глобальный обработчик необработанных ошибок
export const setupGlobalErrorHandling = () => {
  // Обработчик для необработанных промисов
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    logGlobalError('unhandled_promise', error, {
      promise: true,
      prevented: event.defaultPrevented
    });
    
    console.error('Unhandled promise rejection:', error);
  });

  // Обработчик для JavaScript ошибок
  window.addEventListener('error', (event) => {
    logGlobalError('javascript_error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message
    });
    
    console.error('Global JavaScript error:', event.error);
  });

  // Обработчик для ошибок загрузки ресурсов
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      const target = event.target as any;
      logGlobalError('resource_error', new Error(`Failed to load resource: ${target.src || target.href}`), {
        resourceType: target.tagName,
        resourceUrl: target.src || target.href,
        resourceError: true
      });
    }
  }, true);
};

// Функция для логирования глобальных ошибок
const logGlobalError = async (
  errorType: string, 
  error: any, 
  additionalDetails: Record<string, any> = {}
) => {
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_category: 'ui',
      p_message: `Global ${errorType}: ${errorObj.message}`,
      p_details: {
        errorType,
        error: {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack
        },
        ...additionalDetails,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      p_stack_trace: errorObj.stack
    });
  } catch (logError) {
    // Если не можем залогировать в базу, логируем в консоль
    console.error('Failed to log global error:', logError);
    console.error('Original error:', error);
  }
};

// Функция для ручного логирования критических событий
export const logCriticalEvent = async (
  message: string, 
  category: 'security' | 'business' | 'performance' | 'auth' = 'business',
  details: Record<string, any> = {}
) => {
  try {
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_category: category,
      p_message: message,
      p_details: {
        ...details,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });
  } catch (error) {
    console.error('Failed to log critical event:', error);
  }
};

// Функция для логирования безопасности
export const logSecurityEvent = async (
  event: string,
  details: Record<string, any> = {}
) => {
  return logCriticalEvent(`Security Event: ${event}`, 'security', details);
};

// Функция для логирования производительности
export const logPerformanceIssue = async (
  operation: string,
  duration: number,
  details: Record<string, any> = {}
) => {
  if (duration > 3000) { // Логируем только если операция заняла больше 3 секунд
    return logCriticalEvent(
      `Performance Issue: ${operation} took ${duration}ms`, 
      'performance', 
      { duration, operation, ...details }
    );
  }
};