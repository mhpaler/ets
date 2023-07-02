export default function Home() {
  return (
    <div>
      <div className="mb-8 mt-8">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is your name?</span>
            <span className="label-text-alt">Top Right label</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
          />
          <label className="label">
            <span className="label-text-alt">Bottom Left label</span>
            <span className="label-text-alt">Bottom Right label</span>
          </label>
        </div>

        <label
          htmlFor="relayerName"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Name
        </label>
        <input
          id="relayerName"
          aria-label="Relayer name"
          onChange={(e) => e.target.value} // update the recipient state on input change
          placeholder="eg. My relayer"
          className="input input-bordered input-primary w-full max-w-xs1"
        />
      </div>
      <button className="btn">Hello daisyUI</button>
    </div>
  );
}
