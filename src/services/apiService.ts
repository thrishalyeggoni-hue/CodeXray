/**
 * Global API Service layer with structured error logging for backend requests.
 * Intercepts all backend requests and uses console.groupCollapsed to log
 * request payload, full response body, status codes, and parse errors when issues occur.
 */

export interface ApiFetchOptions {
  code: string;
  language?: string;
}

function logGroupedApiError(
  summaryTitle: string,
  details: {
    endpoint: string;
    payload: ApiFetchOptions;
    status?: number;
    statusText?: string;
    rawResponseBody?: string;
    parsedData?: any;
    error?: any;
  }
) {
  const groupLabel = `🚨 [API Service Error] ${summaryTitle} - ${details.endpoint} ${details.status ? `(HTTP ${details.status})` : ''}`;
  console.groupCollapsed(groupLabel);
  console.log('📍 Endpoint:', details.endpoint);
  if (details.status !== undefined) {
    console.log('📊 Status Code:', details.status, details.statusText || '');
  }
  console.log('📦 Request Payload:', details.payload);
  console.log('📄 Raw Response Body:', details.rawResponseBody || '<No Response Body Received>');
  if (details.parsedData !== undefined) {
    console.log('🧩 Parsed Data Object:', details.parsedData);
  }
  if (details.error) {
    console.log('❌ Error Instance / Cause:', details.error);
  }
  console.groupEnd();
}

export async function fetchApiWithLogging<T>(
  endpoint: string,
  payload: ApiFetchOptions
): Promise<T | null> {
  let rawResponseText = '';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    rawResponseText = await response.text();

    if (!response.ok) {
      logGroupedApiError(`HTTP ${response.status} Request Failed`, {
        endpoint,
        payload,
        status: response.status,
        statusText: response.statusText,
        rawResponseBody: rawResponseText,
      });
      return null;
    }

    let parsedData: T;
    try {
      parsedData = JSON.parse(rawResponseText) as T;
    } catch (parseError: any) {
      logGroupedApiError('JSON Parse Failure', {
        endpoint,
        payload,
        status: response.status,
        statusText: response.statusText,
        rawResponseBody: rawResponseText,
        error: parseError,
      });
      return null;
    }

    // Domain payload validation for Flowchart and Notes
    if (endpoint === '/api/flowchart') {
      const flowchartData = parsedData as any;
      if (!flowchartData || typeof flowchartData !== 'object' || !flowchartData.mermaidCode) {
        logGroupedApiError("Invalid Flowchart Payload (Missing 'mermaidCode')", {
          endpoint,
          payload,
          status: response.status,
          statusText: response.statusText,
          rawResponseBody: rawResponseText,
          parsedData,
        });
      }
    } else if (endpoint === '/api/notes') {
      const notesData = parsedData as any;
      if (!notesData || typeof notesData !== 'object' || !notesData.summary) {
        logGroupedApiError("Invalid Study Notes Payload (Missing 'summary')", {
          endpoint,
          payload,
          status: response.status,
          statusText: response.statusText,
          rawResponseBody: rawResponseText,
          parsedData,
        });
      }
    }

    return parsedData;
  } catch (networkOrFetchError: any) {
    logGroupedApiError('Network / Fetch Exception', {
      endpoint,
      payload,
      rawResponseBody: rawResponseText,
      error: networkOrFetchError,
    });
    return null;
  }
}

