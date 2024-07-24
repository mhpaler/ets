import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useRelayers } from "../hooks/useRelayers";
import { useRelayerClient } from "@ethereum-tag-service/sdk-react-hooks";

function CreateTagForm() {
  const [tags, setTags] = useState([]);
  const [selectedRelayer, setSelectedRelayer] = useState(null);
  const { address, chain } = useAccount();

  const { relayers } = useRelayers({});
  const { createTags } = useRelayerClient({
    relayerAddress: selectedRelayer?.id,
    account: address,
    chainId: chain?.id,
  });

  const handleAddTag = (event) => {
    event.preventDefault();
    const target = event.target;
    const newTag = target.tag.value.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      target.tag.value = "";
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSelectRelayer = (event) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  const handleCreateTags = async () => {
    try {
      if (tags.length > 0) {
        await createTags?.(tags);
      }
      setTags([]);
    } catch (error) {
      console.error("Error creating tags:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddTag}>
        <div>
          <input type="text" name="tag" placeholder="Enter tag name" />
          <button type="submit">Add Tag</button>
        </div>
      </form>
      <div>
        {tags.map((tag, index) => (
          <span key={index}>
            {tag}
            <button onClick={() => handleRemoveTag(index)}>x</button>
          </span>
        ))}
      </div>
      <select value={selectedRelayer ? selectedRelayer.id : ""} onChange={handleSelectRelayer}>
        <option disabled value="">
          Select Relayer
        </option>
        {relayers?.map((relayer, index) => (
          <option key={index} value={relayer.id}>
            {relayer.name}
          </option>
        ))}
      </select>
      <button onClick={handleCreateTags} disabled={tags.length === 0 || !selectedRelayer}>
        Create Tags
      </button>
    </div>
  );
}

export default CreateTagForm;
