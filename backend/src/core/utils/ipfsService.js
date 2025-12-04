import axios from 'axios';
import FormData from 'form-data';

/**
 * Upload buffer to IPFS using Pinata.
 * Requires PINATA_JWT or PINATA_API_KEY & PINATA_API_SECRET in env.
 */
export async function uploadToIpfs(buffer, fileName = `file-${Date.now()}.bin`) {
  // Use Pinata
  if (process.env.PINATA_JWT || (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET)) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', buffer, { filename: fileName });

    const headers = formData.getHeaders();
    if (process.env.PINATA_JWT) {
      headers.Authorization = `Bearer ${process.env.PINATA_JWT}`;
    } else {
      headers.pinata_api_key = process.env.PINATA_API_KEY;
      headers.pinata_secret_api_key = process.env.PINATA_API_SECRET;
    }

    try {
      const res = await axios.post(url, formData, { headers, maxBodyLength: Infinity });
      // Pinata returns ipfsHash
      const cid = res.data.IpfsHash || res.data.ipfsHash;
      return { cid, provider: 'pinata', raw: res.data };
    } catch (err) {
      throw new Error(`Pinata upload failed: ${err?.response?.data || err.message}`);
    }
  }

  throw new Error('No IPFS pinning provider configured. Set PINATA_JWT or PINATA_API_KEY & PINATA_API_SECRET in env.');
}
