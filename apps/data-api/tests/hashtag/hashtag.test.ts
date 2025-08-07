import { ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { MintHashtag } from "../../src/generated/HashtagProtocol/HashtagProtocol";
import { Hashtag } from "../../src/generated/schema";
import { handleMintHashtag } from "../../src/mappings/protocol-mapping";

export function runTests(): void {
  test("Hashtag Mint", () => {
    // Initialise
    const HashtagEntity = new Hashtag("1");
    HashtagEntity.save();

    // Call mappings
    const newHashtagEvent = new MintHashtag();

    handleMintHashtag(newHashtagEvent);

    assert.fieldEquals("Hashtag", "1", "id", "1");

    clearStore();
  });
}
