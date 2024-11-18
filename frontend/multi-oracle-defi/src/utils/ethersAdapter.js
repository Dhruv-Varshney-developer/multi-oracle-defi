import { providers } from "ethers";
import { useMemo } from "react";
import { Config, useConnectorClient } from "wagmi";

/**
 * Converts a Viem Client to an ethers.js Signer.
 * @param {Client} client - The Viem client containing the account, chain, and transport information.
 * @returns {Signer} - The ethers.js Signer instance.
 */
export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/**
 * React hook to convert a Viem Client to an ethers.js Signer.
 * @param {object} options - Optional configuration options, including the chainId.
 * @returns {Signer|undefined} - The ethers.js Signer instance if available, otherwise undefined.
 */
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
