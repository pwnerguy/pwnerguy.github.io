import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const mdDir = "./md";
const outDir = "./view";
const template = fs.readFileSync("./template.html", "utf8");

// Ensure /view exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function renderTemplate(title, content) {
    return template
        .replace("{{title}}", title)
        .replace("{{content}}", content);
}

let indexItems = [];

// Read all .md files
fs.readdirSync(mdDir).forEach(file => {
    if (!file.endsWith(".md")) return;

    const mdPath = path.join(mdDir, file);
    const raw = fs.readFileSync(mdPath, "utf8");

    // Extract metadata + content
    const { data, content } = matter(raw);

    const htmlContent = marked(content);
    const slug = file.replace(".md", "");

    // No tags, no categories
    const wrappedContent = `
        <section class="cheatsheet-content">
            ${htmlContent}
        </section>
    `;

    const outPath = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(outPath, renderTemplate(data.title, wrappedContent));

    // Metadata
    indexItems.push({
        slug,
        title: data.title,
        logo: data.logo || null
    });
});

// /cheatsheets/index.html
let indexHTML = `
            <h1 class="cheatsheets-page-title">Cheat Sheets</h1>

            <section class="cheatsheets-list">
            ${indexItems
                .map(i => {
                    return `
                    <article class="cheatsheet-card">
                        <div class="cheatsheet-card-image">
                            ${i.logo ? `<img src="${i.logo}" class="cheatsheet-logo">` : ""}
                        </div>
                        <div class="cheatsheet-card-content">
                            <h2>${i.title}<br>Cheat Sheet</h2>
                        </div>
                        <div class="cheatsheet-card-footer">
                            <a href="/cheatsheets/view/${i.slug}.html" class="cheatsheet-link">Read cheat sheet →</a>
                        </div>
                    </article>
                    `;
                })
                .join("\n")}
            </section>
            `;

fs.writeFileSync("./index.html", renderTemplate("Cheat Sheets", indexHTML));
console.log("Done.");
