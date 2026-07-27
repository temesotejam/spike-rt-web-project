/* ST DfuSe extension placeholder for SPIKE Prime Hub. */
export const SPIKE_RT_LOAD_ADDRESS = 0x08008000;
export const SPIKE_RT_MAX_BYTES = 992 * 1024;
export async function flashSpikeRtFirmware() {
  throw new Error("DfuSe書き込みはまだ実装されていません。");
}
