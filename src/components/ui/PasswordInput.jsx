import { forwardRef, useState } from "react";
import Input from "@/components/ui/Input";
import Icon from "@/components/common/Icon";

const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);

  return (
    <Input
      ref={ref}
      icon="lock"
      type={show ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-600"
        >
          <Icon name={show ? "visibility_off" : "visibility"} />
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;