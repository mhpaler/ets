import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useRelayers } from "../hooks/useRelayers";
import { useRelayerClient } from "@ethereum-tag-service/sdk-react-hooks";

function TaggingRecordForm() {
  const [tags, setTags] = useState([]);
  const [targetURI, setTargetURI] = useState("");
  const [recordType, setRecordType] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState(null);
  const { address, chain } = useAccount();

  const { relayers } = useRelayers({});
  const relayerClient = useRelayerClient({
    relayerAddress: selectedRelayer?.id,
    account: address,
    chainId: chain?.id,
  });

  const handleCreateTaggingRecord = async () => {
    try {
      if (tags.length > 0 && targetURI && recordType && selectedRelayer) {
        await relayerClient?.createTaggingRecord(tags, targetURI, recordType, address);
        setTags([]);
        setTargetURI("");
        setRecordType("");
      }
    } catch (error) {
      console.error("Error creating tagging record:", error);
    }
  };

  const handleAddTag = (event) => {
    event.preventDefault();
    const newTag = event.target.tag.value.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      event.target.tag.value = "";
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <form onSubmit={handleAddTag}>
        <input type="text" name="tag" placeholder="Enter tag name" />
        <button type="submit">Add Tag</button>
      </form>
      <div>
        {tags.map((tag, index) => (
          <span key={index}>
            {tag}
            <button onClick={() => handleRemoveTag(index)}>x</button>
          </span>
        ))}
      </div>
      <input type="text" placeholder="Target URI" value={targetURI} onChange={(e) => setTargetURI(e.target.value)} />
      <input type="text" placeholder="Record Type" value={recordType} onChange={(e) => setRecordType(e.target.value)} />
      <select
        value={selectedRelayer ? selectedRelayer.id : ""}
        onChange={(e) => setSelectedRelayer(relayers.find((r) => r.id.toString() === e.target.value) || null)}
      >
        <option value="">Select Relayer</option>
        {relayers?.map((relayer) => (
          <option key={relayer.id} value={relayer.id}>
            {relayer.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleCreateTaggingRecord}
        disabled={tags.length === 0 || !targetURI || !recordType || !selectedRelayer}
      >
        Create Tagging Record
      </button>
    </div>
  );
}

export default TaggingRecordForm;
