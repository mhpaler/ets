import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { Hashtag } from '../../src/generated/schema'
import { MintHashtag } from '../../src/generated/HashtagProtocol/HashtagProtocol';
import { handleMintHashtag } from '../../src/mappings/protocol-mapping'
import { ethereum } from "@graphprotocol/graph-ts";


export function runTests(): void {
    test('Hashtag Mint', () => {
        // Initialise
        let HashtagEntity = new Hashtag('1')
        HashtagEntity.save()
    
        // Call mappings
        let newHashtagEvent = new MintHashtag();
    
        handleMintHashtag(newHashtagEvent);
    
        assert.fieldEquals('Hashtag', '1', 'id', '1')
    
        clearStore()
      })
}