/**
 * this file should be part of keycloakify integration (be in the package)
 */

import { PropsWithChildren } from "react";
import { JsxEmailComponent } from "jsx-email";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // magic custom element post-processed in render function
      "jsx-email-raw": React.DetailedHTMLProps<React.HTMLProps<HTMLElement>, HTMLElement>;
    }
  }
}

export interface RawOutputProps {
  content?: string;
}

// JSX Emails is escaping  a proper freemarker syntax <#if>
// We use a comment-style syntax <!--#if --> and then replace it
// back to freemarker after render
export const RawOutput: JsxEmailComponent<RawOutputProps> = (props) => (
  <>
    <jsx-email-raw dangerouslySetInnerHTML={{ __html: `<!-- ${props.content} -->` }} />
  </>
);

/**
 * JSX helper to write a freemarker conditions
 *
 * @example
 * ```jsx
 * <If condition="firstName?? && lastName??">
 *   <Then>
 *     Hello {fmExp('firstName')} {fmExp('lastName')}
 *   </Then>
 *   <ElseIf condition="firstName??">
 *     Hello {fmExp('firstName')}
 *   </ElseIf>
 *   <Else>
 *      Hello Guest!
 *   </Else>
 * </If>
 * ```
 *
 * In a simpler cases you can use `If` without `Then` case:
 *
 * @example
 * ```jsx
 * <If condition="firstName?? && lastName??">
 *   Hello {fmExp('firstName')} {fmExp('lastName')}
 * </If>
 * ```
 */
export const If = ({ condition, children }: PropsWithChildren<{ condition: string }>) => (
  <>
    <RawOutput content={`<#if ${condition}>`} />
    {children}
    <RawOutput content="</#if>" />
  </>
);
export const Then = ({ children }: PropsWithChildren) => {
  return children;
};

export const Else = ({ children }: PropsWithChildren) => (
  <>
    <RawOutput content="<#else>"></RawOutput>
    {children}
  </>
);

export const ElseIf = ({
  condition,
  children,
}: PropsWithChildren<{ condition: string }>) => (
  <>
    <RawOutput content={`<#elseif ${condition}>`}></RawOutput>
    {children}
  </>
);
