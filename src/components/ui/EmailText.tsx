import { Fragment } from "react";

/**
 * An email address that may wrap only before its @ or before a dot in the domain, so a narrow
 * screen shows "name" / "@conference" / ".christuniversity.in" instead of cutting a word in half.
 */
export function EmailText({ email }: { email: string }) {
  const [local, domain = ""] = email.split("@");
  return (
    <>
      {local}
      {domain.split(".").map((part, i) => (
        <Fragment key={i}>
          <wbr />
          {i === 0 ? "@" : "."}
          {part}
        </Fragment>
      ))}
    </>
  );
}
