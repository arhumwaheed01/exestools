import type { IconType } from "react-icons";
import {
  LuArrowLeftRight,
  LuBinary,
  LuCaseUpper,
  LuCode,
  LuCombine,
  LuCpu,
  LuFileCode2,
  LuFileText,
  LuScissors,
  LuFingerprint,
  LuHash,
  LuImage,
  LuKeyRound,
  LuListMinus,
  LuSearchCode,
  LuShield,
  LuTable,
  LuTimer,
  LuWrapText,
} from "react-icons/lu";

const toolIconMap: Record<string, IconType> = {
  "word-counter": LuHash,
  "character-counter": LuFileText,
  "uppercase-converter": LuCaseUpper,
  "text-reverser": LuArrowLeftRight,
  "remove-duplicate-lines": LuListMinus,
  "pdf-to-word": LuFileText,
  "word-to-pdf": LuFileText,
  "merge-pdf": LuCombine,
  "split-pdf": LuScissors,
  "compress-pdf": LuFileCode2,
  "pdf-editor-free": LuFileText,
};

const keywordIconRules: Array<[RegExp, IconType]> = [
  [/(image|jpg|jpeg|png|webp|crop|resize|rotate|flip|metadata)/i, LuImage],
  [/(json|yaml|xml|csv)/i, LuTable],
  [/(jwt|hash|sha|md5|encrypt|decrypt)/i, LuShield],
  [/(password|uuid|token|key)/i, LuKeyRound],
  [/(base64|url|encode|decode|binary|ascii|hex|octal|morse)/i, LuBinary],
  [/(sql|js|javascript|css|html|code|cron|headers|user-agent|ip)/i, LuCode],
  [/(format|formatter|minifier|beautify)/i, LuFileCode2],
  [/(timestamp|time|date)/i, LuTimer],
  [/(find|search|diff|compare|checker|validator|lookup|parser)/i, LuSearchCode],
  [/(reverse|shuffle|sort|wrap|unwrap|case|slug|remove|trim)/i, LuWrapText],
];

export function ToolListIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const mapped = toolIconMap[slug];
  if (mapped) {
    const MappedIcon = mapped;
    return <MappedIcon className={className} aria-hidden />;
  }

  const rule = keywordIconRules.find(([rx]) => rx.test(slug));
  const Icon = rule?.[1] ?? LuCpu;
  return <Icon className={className} aria-hidden />;
}
