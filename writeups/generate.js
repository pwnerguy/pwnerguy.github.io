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

    // Badges from front matter
    const badges = (data.categories || [])
        .map(c => `<span class="tag tag-${c.toLowerCase().replace(/\s+/g, "-")}">${c}</span>`)
        .join(" ");

    // Insert badges after h1
    const processedContent = htmlContent.replace(
        /(<h1[^>]*>[\s\S]*?<\/h1>)/,
        `$1\n<div class="writeup-tags">${badges}</div>`
    );

    const wrappedContent = `
        <a href="/writeups" class="back-link">← Go back</a>
        <section class="writeup-content">
            ${processedContent}
        </section>
    `;

    const outPath = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(outPath, renderTemplate(data.title, wrappedContent));

    // Metadata
    indexItems.push({
        slug,
        title: data.title,
        date: data.date,
        logo: data.logo || null,
        categories: data.categories || []
    });
});

// Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    }).replace(",", "");
}

// /writeups/index.html

indexItems.sort((a, b) => new Date(b.date) - new Date(a.date));

let indexHTML = `<h1 class="writeups-page-title">Writeups</h1>
            <section class="filters">
                <input type="text" id="searchInput" placeholder="Search OS, difficulty, techniques, name...">
            </section>
            <section class="writeup-list">
        ${indexItems
            .map(i => {
                const cardClasses = i.categories
                    .map(c => "card-" + c.toLowerCase().replace(/\s+/g, "-"))
                    .join(" ");

                const categoryBadges = i.categories
                    .map(c => `<span class="tag tag-${c.toLowerCase().replace(/\s+/g, "-")}">${c}</span>`)
                    .join(" ");

                return `
                <article class="writeup-card ${cardClasses}" data-categories="${i.categories.join(",")}">
                    <div class="writeup-card-image">
                        ${i.logo ? `<img src="${i.logo}" class="writeup-logo">` : ""}
                    </div>
                    <div class="writeup-card-content">
                        <h2>${i.title}</h2>
                        <p class="writeup-categories">
                            ${categoryBadges}
                        </p>
                    </div>
                    <div class="writeup-card-footer">
                        <p class="writeup-date">${formatDate(i.date)}</p>
                        <a href="/writeups/view/${i.slug}.html" class="writeup-link">Read writeup →</a>
                    </div>
                </article>
                `;
            }).join("\n")}
            </section>
`;

fs.writeFileSync("./index.html", renderTemplate("Writeups", indexHTML));
console.log("Done.");

