import {
  buildDeveloperToolMetaDescription,
  buildDeveloperToolMetaTitle,
  buildImageToolMetaDescription,
  buildImageToolMetaTitle,
  buildTextToolMetaDescription,
  buildTextToolMetaTitle,
} from "@/lib/seo/toolMeta";
import { developerToolSpecsBySlug } from "./developerToolsData";
import { imageToolSpecsBySlug } from "./imageToolsData";
import { getToolBySlug } from "./textToolsData";
import { toolCatalog } from "./toolCatalog";
import type {
  TextToolFullPageContent,
  TextToolSeoSections,
} from "./textToolPageTypes";

export function getTextToolFullPage(
  slug: string,
): TextToolFullPageContent | undefined {
  const tool = getToolBySlug(slug);
  if (!tool) return undefined;

  const catalog = toolCatalog.find((t) => t.slug === slug);
  if (catalog) {
    const seo = buildSeoSections(tool.name, tool.description, tool.relatedTools);

    const meta = {
      title: buildTextToolMetaTitle(tool.name),
      description: buildTextToolMetaDescription(tool.name, tool.description),
    };

    if (catalog.kind === "stats") {
      return {
        kind: "stats",
        meta,
        ui: {
          textareaPlaceholder: `Paste or type text for ${tool.name.toLowerCase()}...`,
          copyButton: "Copy text",
          clearButton: "Clear",
          copySuccess: "Copied!",
          liveCountsHeading: "Live counts",
          stats: {
            words: "Words",
            characters: "Characters (with spaces)",
            charactersNoSpaces: "Characters (no spaces)",
            sentences: "Sentences",
            paragraphs: "Paragraphs",
          },
          statOrder:
            slug === "character-counter"
              ? ["characters", "charactersNoSpaces", "words", "sentences", "paragraphs"]
              : ["words", "characters", "charactersNoSpaces", "sentences", "paragraphs"],
        },
        ...seo,
      };
    }

    if (catalog.kind === "compare") {
      return {
        kind: "compare",
        meta,
        ui: {
          leftPlaceholder: "Paste first text...",
          rightPlaceholder: "Paste second text...",
          resultHeading: "Comparison result",
          copyButton: "Copy result",
          clearButton: "Clear",
          copySuccess: "Copied!",
        },
        ...seo,
      };
    }

    if (catalog.kind === "find-replace") {
      return {
        kind: "find-replace",
        meta,
        ui: {
          textareaPlaceholder: "Paste text for find and replace...",
          findPlaceholder: "Find text",
          replacePlaceholder: "Replace with",
          outputHeading: "Updated text",
          copyButton: "Copy output",
          clearButton: "Clear",
          copySuccess: "Copied!",
        },
        ...seo,
      };
    }

    if (catalog.kind === "speech-tts" || catalog.kind === "speech-stt") {
      return {
        kind: catalog.kind,
        meta,
        ui: {
          textareaPlaceholder: "Type or paste text...",
          outputHeading: "Output",
          outputEmptyHint: "Output appears here.",
          copyInput: "Copy input",
          copyOutput: "Copy output",
          clearButton: "Clear",
          copySuccess: "Copied!",
        },
        ...seo,
      };
    }

    return {
      kind: "transform",
      meta,
      ui: {
        textareaPlaceholder: `Paste or type text for ${tool.name.toLowerCase()}...`,
        outputHeading: "Output",
        outputEmptyHint: "Output will appear here as you type.",
        copyInput: "Copy input",
        copyOutput: "Copy output",
        clearButton: "Clear",
        copySuccess: "Copied!",
        reverseModeCharacters: "Reverse characters",
        reverseModeLines: "Reverse lines",
      },
      ...seo,
    };
  }

  const devSpec = developerToolSpecsBySlug[slug];
  if (!devSpec) {
    const imageSpec = imageToolSpecsBySlug[slug];
    if (!imageSpec) return undefined;

    const seo = buildImageSeoSections(tool.name, tool.description, tool.relatedTools);
    return {
      kind: "image-tool",
      meta: {
        title: buildImageToolMetaTitle(tool.name),
        description: buildImageToolMetaDescription(tool.name, tool.description),
      },
      variant: imageSpec.variant,
      ui: {
        textareaPlaceholder: "Paste Base64 image data here...",
        outputHeading: "Output",
        outputEmptyHint: "Processed image or output text appears here.",
        copyInput: "Copy input",
        copyOutput: "Copy output",
        clearButton: "Clear",
        copySuccess: "Copied!",
      },
      ...seo,
    };
  }

  const seo = buildDeveloperSeoSections(tool.name, tool.description, tool.relatedTools);
  const meta = {
    title: buildDeveloperToolMetaTitle(tool.name),
    description: buildDeveloperToolMetaDescription(tool.name, tool.description),
  };

  const transformUi = {
    textareaPlaceholder: `Paste input for ${tool.name.toLowerCase()}...`,
    outputHeading: "Output",
    outputEmptyHint: "Output appears here as you type or configure options.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear",
    copySuccess: "Copied!",
    reverseModeCharacters: "Reverse characters",
    reverseModeLines: "Reverse lines",
  };

  if (devSpec.pageKind === "transform") {
    return {
      kind: "transform",
      meta,
      ui: transformUi,
      ...seo,
    };
  }

  if (devSpec.pageKind === "dev-hash") {
    return {
      kind: "dev-hash",
      meta,
      algorithm: devSpec.algorithm!,
      ui: transformUi,
      ...seo,
    };
  }

  return {
    kind: "dev-special",
    meta,
    variant: devSpec.variant!,
    ui: transformUi,
    ...seo,
  };
}

function buildImageSeoSections(
  toolName: string,
  description: string,
  relatedTools: string[],
): TextToolSeoSections {
  void relatedTools;
  const paragraphs = [
    `${toolName} is a browser-based image utility designed for fast, privacy-aware workflows. Instead of uploading files to a remote service, you can process common image tasks directly in your tab with modern web APIs like Canvas, FileReader, and Blob URLs. This approach is practical for developers, designers, marketers, support teams, and creators who need quick transformations without installing desktop software or waiting for server jobs to finish.`,
    `Image work often includes repetitive micro-tasks: compressing screenshots for documentation, converting formats for compatibility, resizing assets for responsive layouts, rotating photos from mobile devices, and removing metadata before sharing externally. ${toolName} focuses on one of these jobs so the interface stays clear. Upload a file, preview before and after, tweak settings where available, and download the result. Keeping the process simple helps you iterate quickly and avoid accidental quality loss.`,
    `Client-side processing can improve both speed and control. Since work happens in your browser, there is no queue latency for standard operations, and you can immediately test multiple settings (for example, JPEG quality levels or target dimensions) to strike the right balance between fidelity and file size. This is especially useful for web performance workflows where a few kilobytes matter across many images and pages.`,
    `Teams also benefit from consistency. A stable URL for ${toolName} can be shared in runbooks, onboarding docs, or QA checklists so everyone follows the same steps for common tasks. That reduces one-off manual edits and makes outputs easier to review. Internal linking between related tools lets you chain workflows efficiently—for example, convert a format, then compress, then inspect metadata—without bouncing between unrelated sites.`,
    `Security and privacy still depend on your environment and policies. Browser-based tools are convenient, but you should continue to handle sensitive files according to company rules. For regulated or confidential media, confirm approved workflows before processing. ExesTools emphasizes transparent controls and straightforward output so you can make informed decisions while keeping everyday image tasks lightweight and fast.`,
    `Mobile-friendly layouts make these tools useful beyond desktop setups. You can drop an image from your phone, perform quick edits, and share optimized output within minutes. The interface is responsive and built for touch interactions while still scaling up for larger desktop previews. Whether you are preparing assets for a CMS, creating issue repro screenshots, or cleaning up files before upload, ${toolName} helps you complete the task with minimal friction.`,
    `As the catalog grows, ExesTools keeps a programmatic SEO structure with clean slugs under /tools/[slug], standardized metadata, step-by-step usage, FAQs, and related links. That architecture supports long-term scale across text, developer, and image categories while preserving a consistent user experience. ${description}`,
    `${toolName} is free to use and available instantly in modern browsers. Upload your file, review the result, and download when ready. If your workflow needs additional steps, use the related tools below to continue from conversion to compression to metadata handling without starting over.`,
  ];

  return {
    seoArticle: { heading: toolName, paragraphs },
    howToUse: {
      heading: `How to use ${toolName}`,
      steps: [
        { title: "Step 1: Upload or drop image", body: "Choose a local file or drag and drop it into the upload area." },
        { title: "Step 2: Configure options", body: "Adjust quality, size, rotation, format, or other settings depending on the selected tool." },
        { title: "Step 3: Review previews", body: "Compare before and after output to verify dimensions, quality, and expected result." },
        { title: "Step 4: Download output", body: "Use the download action to save the processed image to your device." },
      ],
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { question: `What does ${toolName} do?`, answer: description },
        { question: "Do I need to install software?", answer: "No. The tool runs in your browser with no installation." },
        { question: "Can I use this on mobile?", answer: "Yes. The layout is responsive and supports touch interactions." },
        { question: "Is processing client-side?", answer: "Where possible, image processing uses browser APIs like Canvas and FileReader on your device." },
        { question: "Can I preview before download?", answer: "Yes. The workspace includes before/after preview blocks for visual verification." },
      ],
    },
    relatedTools: { heading: "Related tools" },
  };
}

function buildDeveloperSeoSections(
  toolName: string,
  description: string,
  relatedTools: string[],
): TextToolSeoSections {
  void relatedTools;
  const baseParagraphs = [
    `${toolName} is a developer-focused utility you can run directly in the browser. It is built for engineers, QA teams, technical writers, and anyone who needs a quick, reliable result without opening a heavy IDE plugin or shipping data to an unknown server. Whether you are debugging a flaky integration, normalizing a config snippet, or preparing examples for documentation, the same URL gives you a consistent workspace every time.`,
    `Modern software workflows depend on dozens of small conversions: encoding and decoding, formatting and minifying, sanity checks on tokens and addresses, and readable dumps of structured data. ${toolName} targets one slice of that work so you can complete it in seconds. Because the interface presents clear input and output regions, you can compare before-and-after states instantly, catch subtle mistakes early, and copy results straight into tickets, terminals, or version control messages.`,
    `Client-side processing is a deliberate choice for developer ergonomics and practical privacy. Many tasks—JSON inspection, Base64 transforms, hash generation, and header parsing—do not need a backend if implemented carefully in modern browsers. That means lower latency for short jobs and fewer moving parts when you are offline or behind a restrictive network. ExesTools keeps controls obvious so onboarding stays minimal even when you are context-switching between incidents and feature work.`,
    `${toolName} also complements your local toolchain. Editors and CLIs are powerful, but a shareable link is sometimes faster when you are pairing remotely or handing steps to someone who does not share your environment. Bookmark the page, drop it into runbooks, or paste it into onboarding notes alongside ${description.toLowerCase()} The predictable layout scales as ExesTools adds more utilities: each tool keeps the same content structure for long-form guidance, FAQs, and related links so navigation remains familiar.`,
    `Quality and safety still require human judgment. Automated helpers can misinterpret edge cases, especially with loosely specified formats or legacy data. Use ${toolName} to accelerate exploration, then apply your domain rules before production changes. For cryptographic material, treat hashes and decoders as diagnostics, not authorization: verifying signatures, enforcing access control, and storing secrets are separate concerns that belong in audited libraries and services.`,
    `Performance matters when you iterate. The workspace is optimized for responsive typing, large pastes when reasonable, and immediate feedback so you are not waiting on network round trips. That responsiveness encourages experimentation—you can try alternate encodings, reformat minified blobs, and validate assumptions interactively. When the output is wrong, you can adjust input right away rather than re-running a script and hunting through logs.`,
    `Documentation and support teams benefit from the same clarity. Repro steps often include redacted headers, timestamps, and UUID examples; generating those artifacts quickly makes knowledge bases more accurate. Engineers reviewing pull requests can keep a tab open to normalize diffs of JSON or CSS without breaking focus. The adjacent related tools section helps you chain tasks such as decoding, reformatting, and validating in the same session without rebuilding context.`,
    `ExesTools pages are structured for programmatic SEO and long-term maintenance. Stable slugs under /tools/[slug] support sitemaps, internal linking, and category hubs like Developer Tools that group related utilities. That architecture scales to hundreds of pages while keeping each tool self-contained. If you need a dependable, no-frills helper for everyday engineering chores, ${toolName} is designed to be the page you open first—fast, readable, and ready for the next task.`,
    `${description} This guide includes step-by-step usage and answers to common questions so you can adopt the workflow quickly and share it with collaborators.`,
  ];

  return {
    seoArticle: {
      heading: `${toolName}`,
      paragraphs: baseParagraphs,
    },
    howToUse: {
      heading: `How to use ${toolName}`,
      steps: [
        {
          title: "Step 1: Prepare your input",
          body: "Paste text, code, headers, or other values into the workspace, depending on what the tool expects.",
        },
        {
          title: "Step 2: Review output",
          body: "Watch the output pane update. For generators, use the on-page actions to produce a fresh value when available.",
        },
        {
          title: "Step 3: Copy or capture results",
          body: "Copy output to your clipboard and move it into your editor, shell, ticket, or test fixture.",
        },
        {
          title: "Step 4: Reset for the next task",
          body: "Clear the fields when you are done so the next paste starts from a clean state.",
        },
      ],
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { question: `What does ${toolName} do?`, answer: description },
        {
          question: "Does my data leave my browser?",
          answer:
            "These utilities are built to run client-side in typical usage so your input is processed locally. Always exercise caution with production secrets and follow your organization’s policies.",
        },
        {
          question: "Can I use this at work?",
          answer:
            "Yes. The layout is tuned for professional workflows: clear labels, copy actions, and related tools for chaining tasks.",
        },
        {
          question: "Will this work on mobile?",
          answer:
            "Yes. The interface is responsive, though very large pastes are more comfortable on desktop browsers.",
        },
        {
          question: "How does this relate to other developer tools here?",
          answer:
            "Each page links to adjacent utilities—encoding, formatting, timestamps, and more—so you can move through a debugging flow without searching for new sites.",
        },
      ],
    },
    relatedTools: {
      heading: "Related tools",
    },
  };
}

function buildSeoSections(
  toolName: string,
  description: string,
  relatedTools: string[],
): TextToolSeoSections {
  void relatedTools;
  const baseParagraphs = [
    `${toolName} is a browser-based text utility built for speed, clarity, and repeatable workflows. Instead of opening heavy software or writing one-off scripts, you can paste content and get immediate results. This is especially useful for editors, marketers, students, support teams, and developers who need small transformations many times per day. The interface keeps input and output side by side, so iteration is fast and mistakes are easier to catch before content moves to a CMS, spreadsheet, or production system.`,
    `The core value of ${toolName} is reducing friction in routine tasks. Repetitive editing often introduces subtle errors when done manually, especially under deadlines. A focused tool automates the mechanical parts and gives you a predictable output with one workflow every time. Since processing runs in the browser, you can use it across devices without installs, and the same URL can be shared with teammates for consistent results.`,
    `For teams, consistency is just as important as speed. When everyone applies the same transformation rules, documents stay cleaner across handoffs. That matters in SEO publishing, operations, localization, and technical documentation where formatting inconsistencies create downstream issues. By using ${toolName} in a structured way, teams can standardize micro-tasks and spend more time on high-value decisions like clarity, tone, and quality control.`,
    `Privacy and practicality also matter in day-to-day workflows. Browser tools help you quickly process drafts without setting up infrastructure. ExesTools focuses on transparent behavior: input, output, copy, and clear actions are always visible, and related tools are linked directly so you can chain tasks without context switching. This keeps momentum high when your pipeline needs multiple passes such as cleanup, conversion, counting, and validation.`,
    `Another advantage is accessibility and onboarding. Lightweight interfaces with labeled controls are easier for new contributors to learn than custom scripts. A stable URL for ${toolName} can be added to internal docs so contractors, students, or teammates follow the same process from day one. Over time, that reduces knowledge silos and improves output quality across the entire team.`,
    `Practically, ${toolName} fits into many workflows: preparing social copy, cleaning CRM exports, normalizing technical notes, checking assignment limits, or transforming datasets before import. The tool is intentionally focused so you can run it repeatedly without mental overhead. Combined with related utilities, it becomes part of a reliable text operations toolkit.`,
    `Because editing needs evolve, this page is designed for scale. ExesTools supports programmatic content and clean URLs, so new tools can be added with consistent UX and SEO structure. That means today’s quick task can become tomorrow’s standard operating step, all within one ecosystem that remains easy to navigate.`,
    `If you want dependable results with minimal setup, ${toolName} is a practical choice. Paste text, review output, copy what you need, and continue your workflow. For adjacent tasks, use the related tools below to keep formatting and analysis in one streamlined flow. ${description}`,
  ];

  return {
    seoArticle: {
      heading: `${toolName} Tool`,
      paragraphs: baseParagraphs,
    },
    howToUse: {
      heading: `How to use ${toolName.toLowerCase()}`,
      steps: [
        { title: "Step 1: Add your text", body: "Paste or type content into the input area." },
        { title: "Step 2: Review live output", body: "Output updates as you type so you can verify results instantly." },
        { title: "Step 3: Copy results", body: "Use copy to move text into your editor, CMS, or app." },
        { title: "Step 4: Start again", body: "Clear the workspace to process a new text block quickly." },
      ],
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { question: `What does ${toolName} do?`, answer: description },
        { question: "Is this tool free?", answer: "Yes. You can use this tool for free in your browser." },
        { question: "Does it work on mobile devices?", answer: "Yes. The layout is responsive and works across phone, tablet, and desktop." },
        { question: "Can I copy the result?", answer: "Yes. Use the copy button to copy output quickly." },
        { question: "Is this suitable for professional workflows?", answer: "Yes. It is designed for repeatable, production-friendly text operations." },
      ],
    },
    relatedTools: {
      heading: "Related tools",
    },
  };
}
