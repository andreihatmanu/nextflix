import { verifyToken } from '@/lib/utils';
import { ServerResponse, IncomingMessage } from 'http';
import { PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';

const useRedirectUser = async (context: {
  req: any;
  res?: ServerResponse<IncomingMessage>;
  params?: ParsedUrlQuery | undefined;
  query?: ParsedUrlQuery;
  preview?: boolean | undefined;
  previewData?: PreviewData;
  draftMode?: boolean | undefined;
  resolvedUrl?: string;
  locale?: string | undefined;
  locales?: string[] | undefined;
  defaultLocale?: string | undefined;
}) => {
  const token = context.req ? context.req?.cookies.token : null;
  const userId = await verifyToken(token);

  return {
    userId,
    token,
  };
};
export default useRedirectUser;
