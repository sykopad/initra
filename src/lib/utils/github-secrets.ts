/**
 * Initra — GitHub Secrets Utility
 * Handles encryption and provisioning of secrets for GitHub Actions.
 */

import { Octokit } from "octokit";
import sodium from "libsodium-wrappers";

/**
 * Encrypts a secret value for the GitHub API using NaCl crypto_box_seal.
 */
async function encryptSecret(publicKey: string, value: string): Promise<string> {
  await sodium.ready;
  
  // Convert the public key and value to Uint8Array
  const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(value);
  
  // Encrypt the secret using the public key
  const encBytes = sodium.crypto_box_seal(binsec, binkey);
  
  // Convert the encrypted bytes to base64
  return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}

/**
 * Provisions a secret to a GitHub repository.
 */
export async function injectRepoSecret(
  octokit: Octokit, 
  owner: string, 
  repo: string, 
  secretName: string, 
  secretValue: string
) {
  try {
    // 1. Get the public key for the repository
    const { data: publicKey } = await octokit.rest.actions.getRepoPublicKey({
      owner,
      repo,
    });

    // 2. Encrypt the secret value
    const encryptedValue = await encryptSecret(publicKey.key, secretValue);

    // 3. Create or update the repository secret
    await octokit.rest.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKey.key_id,
    });

    console.log(`[GitHub] Secret '${secretName}' injected successfully into ${owner}/${repo}`);
  } catch (error) {
    console.error(`[GitHub] Failed to inject secret '${secretName}':`, error);
    throw error;
  }
}
