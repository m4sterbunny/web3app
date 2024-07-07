// playing with idea of having for-sale pfp display IF no ENS avatar, but running out of time
// Needs local storage of first API call to opensea -- can get the data from api, but retrieving from
// local storage problem unsolved

import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;

export async function fetchLatestListings(): Promise<void> {
  const url = 'https://api.opensea.io/v2/orders/ethereum/seaport/listings?limit=20&order_direction=desc';

  try {
    const response = await axios.get(url, {
      headers: {
        accept: 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    const listings = response.data.orders;

    // Extract relevant data and add an ID
    const extractedData = listings.map((listing, index) => {
      const { created_date, closing_date, maker_asset_bundle } = listing;
      const assets = maker_asset_bundle.assets.map((asset) => ({
        token_id: asset.token_id,
        image_url: asset.image_url,
        name: asset.name,
        description: asset.description,
        asset_contract: {
          address: asset.asset_contract.address,
          asset_contract_type: asset.asset_contract.asset_contract_type,
          chain_identifier: asset.asset_contract.chain_identifier,
          schema_name: asset.asset_contract.schema_name,
          symbol: asset.asset_contract.symbol,
        },
      }));
      return { id: index + 1, created_date, closing_date, assets };
    });

    // Store data in local storage
    localStorage.setItem('latestListings', JSON.stringify(extractedData));

    console.log('Latest listings data stored in local storage');
  } catch (error) {
    console.error('Error fetching listings from OpenSea:', error);
  }
}

export function getRandomListing(): any {
  const listings = JSON.parse(localStorage.getItem('latestListings') || '[]');
  if (listings.length === 0) {
    console.error('No listings found in local storage');
    return null;
  }

  const maxId = listings.length;
  const randomId = Math.floor(Math.random() * maxId) + 1;
  return listings.find(listing => listing.id === randomId);
}
