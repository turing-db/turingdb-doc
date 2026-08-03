import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router";
import App, { preload } from "./App";

/**
 * Renders one route to static HTML.
 *
 * `prerenderToNodeStream` (not `renderToString`) is required: page bodies are dynamic
 * imports, and the synchronous renderers either emit the Suspense fallback or throw when a
 * component suspends. The module is also preloaded first so the markup is complete rather
 * than a fallback the client would have to fill in.
 */
export async function render(url: string): Promise<string> {
  await preload(url);
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
