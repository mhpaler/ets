import { useEffect } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRelayers } from "../../../hooks/useRelayers";
import { useDebounce } from "../../../hooks/useDebounce";

const AddRelayerSchema = z.object({
  name: z.string().min(3).max(20),
  existingRelayer: z.string().refine((value) => {
    // if existingRelayer is "true", return false to fail validation.
    return value === "true" ? false : true;
  }, "Name is taken"),
});

type AddRelayerSchemaType = z.infer<typeof AddRelayerSchema>;

const RelayerSearch = () => {
  const {
    register,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm<AddRelayerSchemaType>({
    defaultValues: {
      name: "",
      existingRelayer: "false",
    },
    resolver: zodResolver(AddRelayerSchema),
  });

  //  const nameValue = watch("name");
  //  const { relayers } = useRelayers({
  //    pageSize: 1,
  //    skip: 0,
  //    filter: { name: nameValue },
  //    config: {
  //      revalidateOnFocus: false,
  //      revalidateOnMount: true,
  //      revalidateOnReconnect: false,
  //      refreshWhenOffline: false,
  //      refreshWhenHidden: false,
  //      refreshInterval: 0,
  //    },
  //  });
  //
  //  const debouncedRelayers = useDebounce(relayers, 200);
  //
  //  useEffect(() => {
  //    // I wasn't able to run a query for existing relayers in the zod validation
  //    // so I'm instead watching the name field, re-running the query on each
  //    // key stroke, and if an existing relayer is found, I set the value
  //    // on a hidden field to "true", and use zod to validate that form field.
  //    // ie. if the value of existingRelayer == "true", fail form validation
  //    // and notify user.
  //    if (debouncedRelayers && debouncedRelayers.length > 0) {
  //      setValue("existingRelayer", "true");
  //    } else {
  //      setValue("existingRelayer", "false");
  //    }
  //    trigger("existingRelayer");
  //  }, [nameValue, setValue, trigger, debouncedRelayers]);

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="grid">
        <input
          placeholder="Relayer name"
          {...register("name")}
          autoComplete="off"
          type="search"
          className={`${
            errors && (errors.name || errors.existingRelayer)
              ? "input input-error"
              : "input"
          } input-bordered w-full max-w-xs1`}
        />
        <input
          placeholder="Relayer hidden"
          {...register("existingRelayer")}
          type="hidden"
        />
        <label className="label">
          <ul>
            {errors.name && (
              <li className="label-text-alt text-error text-sm">
                {errors.name.message}
              </li>
            )}
            {errors.existingRelayer && (
              <li className="label-text-alt text-error text-sm">
                {errors.existingRelayer.message}
              </li>
            )}
          </ul>
        </label>
      </div>
    </div>
  );
};

export { RelayerSearch };
