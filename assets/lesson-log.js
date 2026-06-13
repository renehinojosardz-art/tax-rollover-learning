(function () {
  const STORAGE_KEY = "taxRolloverLearning.answerLog.v1";

  const styles = `
    .lesson-log {
      margin-top: 28px;
      padding: 16px;
      border: 1px solid #d9dee7;
      border-radius: 8px;
      background: #f8fafc;
    }
    .lesson-log h2,
    .answer-log-page h2 {
      margin: 0 0 10px;
      font-size: 22px;
      letter-spacing: 0;
    }
    .lesson-log p,
    .answer-log-page p {
      margin: 0 0 12px;
      color: #5f6b7a;
    }
    .lesson-log textarea {
      width: 100%;
      min-height: 150px;
      resize: vertical;
      padding: 12px;
      border: 1px solid #cfd6e2;
      border-radius: 8px;
      font: inherit;
      line-height: 1.45;
      color: #172033;
      background: #fff;
    }
    .lesson-log-actions,
    .answer-log-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .lesson-log button,
    .answer-log-page button,
    .answer-log-page a.answer-log-button {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      border: 1px solid #cfd6e2;
      border-radius: 8px;
      padding: 9px 12px;
      background: #fff;
      color: #172033;
      font: inherit;
      text-decoration: none;
      cursor: pointer;
    }
    .lesson-log button.primary,
    .answer-log-page button.primary {
      background: #0f766e;
      border-color: #0f766e;
      color: #fff;
    }
    .lesson-log-status {
      min-height: 22px;
      margin-top: 10px;
      color: #0f766e;
      font-size: 14px;
    }
    .answer-log-entry {
      border: 1px solid #d9dee7;
      border-radius: 8px;
      padding: 14px;
      margin: 12px 0;
      background: #fff;
    }
    .answer-log-entry h3 {
      margin: 0 0 6px;
      font-size: 18px;
    }
    .answer-log-entry time {
      display: block;
      margin-bottom: 10px;
      color: #5f6b7a;
      font-size: 13px;
    }
    .answer-log-entry pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      padding: 12px;
      border-radius: 8px;
      background: #eef2f7;
      color: #172033;
      font: 14px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    @media (max-width: 760px) {
      .lesson-log {
        margin-top: 22px;
        padding: 14px;
      }
      .lesson-log-actions,
      .answer-log-actions {
        display: grid;
        grid-template-columns: 1fr;
      }
      .lesson-log button,
      .answer-log-page button,
      .answer-log-page a.answer-log-button {
        width: 100%;
      }
    }
  `;

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function readEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function writeEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function lessonTitle() {
    const h1 = document.querySelector("h1");
    return h1 ? h1.textContent.trim() : document.title;
  }

  function scenarioText() {
    const quizText = document.querySelector(".quiz p");
    return quizText ? quizText.textContent.trim() : "";
  }

  function currentDraftKey() {
    return `taxRolloverLearning.draft.${location.pathname}`;
  }

  function entryToMarkdown(entry) {
    return [
      `# Lesson Answer: ${entry.lesson}`,
      "",
      `- Date: ${entry.date}`,
      `- URL: ${entry.url}`,
      "",
      "## Prompt",
      "",
      entry.prompt || "No prompt captured.",
      "",
      "## Rene's Answer",
      "",
      entry.answer || "",
      "",
      "## Request",
      "",
      "Please review this answer, give supervising-lawyer feedback, update the private answer log, and create a learning record if this shows durable understanding or a corrected misconception."
    ].join("\n");
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  function downloadMarkdown(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildEntry(answer) {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toISOString(),
      lesson: lessonTitle(),
      url: location.href,
      prompt: scenarioText(),
      answer
    };
  }

  function renderLessonLogger() {
    const main = document.querySelector("main");
    if (!main) return;

    const section = document.createElement("section");
    section.className = "lesson-log";
    section.setAttribute("aria-labelledby", "lesson-log-heading");
    section.innerHTML = `
      <h2 id="lesson-log-heading">Your Answer Log</h2>
      <p>Write your answer here. It saves only in this browser unless you copy or export it.</p>
      <textarea id="lesson-log-answer" placeholder="Draft your answer in your own words."></textarea>
      <div class="lesson-log-actions">
        <button type="button" class="primary" id="lesson-log-save">Save on this device</button>
        <button type="button" id="lesson-log-copy">Copy for Codex</button>
        <button type="button" id="lesson-log-export">Export Markdown</button>
        <button type="button" id="lesson-log-clear">Clear draft</button>
      </div>
      <div class="lesson-log-status" id="lesson-log-status" role="status" aria-live="polite"></div>
    `;

    const footer = main.querySelector("footer");
    if (footer) {
      main.insertBefore(section, footer);
    } else {
      main.appendChild(section);
    }

    const textarea = section.querySelector("#lesson-log-answer");
    const status = section.querySelector("#lesson-log-status");
    const draftKey = currentDraftKey();
    textarea.value = localStorage.getItem(draftKey) || "";

    textarea.addEventListener("input", () => {
      localStorage.setItem(draftKey, textarea.value);
    });

    function currentEntry() {
      return buildEntry(textarea.value.trim());
    }

    section.querySelector("#lesson-log-save").addEventListener("click", () => {
      const answer = textarea.value.trim();
      if (!answer) {
        status.textContent = "Write an answer before saving.";
        return;
      }
      const entries = readEntries();
      const entry = buildEntry(answer);
      entries.unshift(entry);
      writeEntries(entries);
      status.textContent = "Saved on this device.";
    });

    section.querySelector("#lesson-log-copy").addEventListener("click", async () => {
      const answer = textarea.value.trim();
      if (!answer) {
        status.textContent = "Write an answer before copying.";
        return;
      }
      try {
        await copyText(entryToMarkdown(currentEntry()));
        status.textContent = "Copied. Paste it into Codex and ask me to review and log it.";
      } catch (error) {
        status.textContent = "Copy failed. Use Export Markdown instead.";
      }
    });

    section.querySelector("#lesson-log-export").addEventListener("click", () => {
      const answer = textarea.value.trim();
      if (!answer) {
        status.textContent = "Write an answer before exporting.";
        return;
      }
      const slug = lessonTitle().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      downloadMarkdown(`${slug}-answer.md`, entryToMarkdown(currentEntry()));
      status.textContent = "Markdown file exported.";
    });

    section.querySelector("#lesson-log-clear").addEventListener("click", () => {
      textarea.value = "";
      localStorage.removeItem(draftKey);
      status.textContent = "Draft cleared.";
    });
  }

  function renderAnswerLogPage() {
    const container = document.querySelector("[data-answer-log]");
    if (!container) return;

    const entries = readEntries();
    const markdown = entries.map(entryToMarkdown).join("\n\n---\n\n");
    container.innerHTML = `
      <section class="answer-log-page">
        <h2>Saved Answers</h2>
        <p>These entries are stored only in this browser's local storage. They are not in GitHub and are not sent anywhere automatically.</p>
        <div class="answer-log-actions">
          <button type="button" class="primary" id="copy-all-answers">Copy all for Codex</button>
          <button type="button" id="export-all-answers">Export all Markdown</button>
          <button type="button" id="clear-all-answers">Clear saved answers</button>
          <a class="answer-log-button" href="index.html">Back to lessons</a>
        </div>
        <div id="answer-log-status" class="lesson-log-status" role="status" aria-live="polite"></div>
        <div id="answer-log-entries"></div>
      </section>
    `;

    const list = container.querySelector("#answer-log-entries");
    const status = container.querySelector("#answer-log-status");
    if (!entries.length) {
      list.innerHTML = `<p>No saved answers on this device yet.</p>`;
    } else {
      list.innerHTML = entries.map((entry) => `
        <article class="answer-log-entry">
          <h3>${escapeHtml(entry.lesson)}</h3>
          <time>${escapeHtml(entry.date)}</time>
          <p><strong>Prompt:</strong> ${escapeHtml(entry.prompt || "No prompt captured.")}</p>
          <pre>${escapeHtml(entry.answer || "")}</pre>
        </article>
      `).join("");
    }

    container.querySelector("#copy-all-answers").addEventListener("click", async () => {
      if (!entries.length) {
        status.textContent = "No saved answers to copy.";
        return;
      }
      try {
        await copyText(markdown);
        status.textContent = "Copied all saved answers for Codex.";
      } catch (error) {
        status.textContent = "Copy failed. Use Export all Markdown instead.";
      }
    });

    container.querySelector("#export-all-answers").addEventListener("click", () => {
      if (!entries.length) {
        status.textContent = "No saved answers to export.";
        return;
      }
      downloadMarkdown("tax-rollover-learning-answers.md", markdown);
      status.textContent = "Markdown file exported.";
    });

    container.querySelector("#clear-all-answers").addEventListener("click", () => {
      if (!confirm("Clear all saved answers from this browser?")) return;
      writeEntries([]);
      location.reload();
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  addStyles();
  if (document.querySelector("[data-answer-log]")) {
    renderAnswerLogPage();
  } else {
    renderLessonLogger();
  }
})();
