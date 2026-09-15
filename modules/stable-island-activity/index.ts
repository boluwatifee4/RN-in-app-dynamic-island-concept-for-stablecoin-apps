import { requireNativeModule } from 'expo-modules-core';

let NativeModule: any;
try {
  NativeModule = requireNativeModule('StableIslandActivity');
} catch {
  NativeModule = null;
}

export async function startActivity(
  title: string,
  subtitle: string,
  type: string
): Promise<string | null> {
  if (!NativeModule) return null;
  try {
    return await NativeModule.startActivity(title, subtitle, type);
  } catch {
    return null;
  }
}

export async function updateActivity(
  stage: string,
  progress: number
): Promise<void> {
  if (!NativeModule) return;
  try {
    await NativeModule.updateActivity(stage, progress);
  } catch {}
}

export async function endActivity(finalStage: string): Promise<void> {
  if (!NativeModule) return;
  try {
    await NativeModule.endActivity(finalStage);
  } catch {}
}
