import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      },
});

/**
 * Standardizes logging for credit transactions
 */
export const logCreditUsage = (userId: string, amount: number, model: string, action: string) => {
  logger.info({
    type: 'credit_usage',
    userId,
    amount,
    model,
    action,
    timestamp: new Date().toISOString(),
  }, `Credit deduction: ${amount} credits for ${action} using ${model}`);
};
