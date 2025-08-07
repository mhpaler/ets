import { createTokenClient } from "@ethereum-tag-service/sdk-core";

const chainId = 84532;
const client = createTokenClient({ chainId });
const tag = "#rainbow"; // Edit to your hashtag
const tagExists = await client?.tagExistsByString(tag);
console.info(tagExists);
export { tag, tagExists };
