import { runId } from '../config';

export default function globalSetup(): void {
  console.log(`[api-tests] run ${runId()}`);
}
