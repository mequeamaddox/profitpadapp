// Feature switches shared by the server and the client.

/**
 * Read receipt photos with AI to pre-fill expenses. Off for now: receipts can
 * still be photographed and attached, the details are just typed in by hand.
 * Turning it on also needs ANTHROPIC_API_KEY set on the server.
 */
export const RECEIPT_SCANNING_ENABLED = false;
