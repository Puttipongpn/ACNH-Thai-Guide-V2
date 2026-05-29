# Facebook Import Analysis

Generated: 2026-05-29

Raw data path: `/Users/panupong.ma/Documents/Codex/2026-05-28/facebook-group-private-animal-crossing-new`

## Safety Scope

- No database import was performed.
- Raw files were inspected but not modified or deleted.
- Existing app data was not overwritten.
- Usable local images were referenced only by raw local path in `data/facebook-import-candidates.json`; they were not copied into `backend/uploads` in this step.

## Summary Of Discovered Data

- **Total files:** 93 files discovered in the raw folder tree
- **JSON:** 5 files: raw scrape, structured group extraction, curated image candidates, image review, OCR targets
- **Markdown:** 3 files: organized content, source inventory, extraction progress
- **Images:** 83 image files total: 49 .jpg and 34 .png
- **System files:** 2 .DS_Store files, ignore

Structured extraction metadata from `acnh_group_content.json` says text extraction is complete, image OCR is still pending, the source group slug is `AnixNewHorizonsTH`, text-read posts total `258`, photo links total `710`, and the linked post graph is closed.

The most import-ready subset is the curated image export: 15 curated guide posts with 50 downloaded images and 0 blocked images.

## Recommended Usable Files

- `acnh_curated_post_images.json` - Best machine source for import candidates: 15 curated guide posts, source URLs, post text, and 50 downloaded image references.
- `acnh_curated_image_assets.json` - Best image review source: reviewed/partial status and content findings for priority guides.
- `curated_post_images/` - Best image source: 15 guide folders with downloaded local images. Keep raw paths untouched; copy selected files only during a later import step.
- `acnh_group_content.json` - Useful supporting evidence for full text extraction and metadata, but too broad/noisy for direct import.
- `acnh_source_inventory.md` - Useful audit trail showing 258 text-read posts, 710 photo links, 0 errors, and image OCR pending.
- `acnh_group_content_organized.md` - Useful human review document and category index, not preferred as machine import input.

## Files To Ignore Or Use Only As Evidence

- `.DS_Store and curated_post_images/.DS_Store` - macOS metadata only.
- `acnh_raw_extraction.json` - Keep for traceability, but do not import directly: very large raw scrape with duplicated/noisy Facebook DOM data.
- `ocr_image_assets/*.png` - Treat as OCR/reference derivatives. Many have .png names but JPEG binary content; verify before using.
- `acnh_extraction_progress.md` - Progress notes only. Useful for context, not import content.

## Duplicate Groups

- The same Facebook post can appear in acnh_raw_extraction.json, acnh_group_content.json, acnh_group_content_organized.md, acnh_source_inventory.md, acnh_curated_post_images.json, and acnh_curated_image_assets.json. The candidate JSON chooses acnh_curated_post_images.json as the canonical source per guide.
- curated_post_images/<guide-id>/ and ocr_image_assets/<guide-id>-NN.png contain overlapping image derivatives. Prefer curated_post_images for future upload copying.
- Guide IDs are used as de-duplication keys because each curated item has a stable sourcePostId/sourceUrl.

## Broken Or Incomplete Signals

- Image OCR is explicitly marked pending in the structured extraction metadata.
- The OCR asset folder contains files with `.png` names that appear to be derived/reference copies rather than the safest source images.
- Some curated guides have notes about expected image-count mismatches or small text requiring manual verification.
- The raw scrape is large and Facebook-DOM-shaped; it likely contains repeated UI text, reactions, comments counters, and duplicated references.

## Posts That Look Importable

- มารยาทสำคัญบนเกาะผู้อื่น (island-visitor-etiquette) - suggested category `rules-and-important-info`, tags `beginner`, `tips`, `island`, `faq`.
- NSO คืออะไรและทำอะไรได้บ้างใน ACNH (nso-benefits) - suggested category `rules-and-important-info`, tags `beginner`, `tips`.
- หลังจบ 3 ดาวแล้วควรทำอะไรต่อ (after-three-stars-what-next) - suggested category `beginner-guide`, tags `beginner`, `tips`, `island`.
- การย้ายเกาะและย้ายข้อมูล Animal Crossing (island-transfer-overview) - suggested category `rules-and-important-info`, tags `beginner`, `faq`.
- Amiibo Figures / Amiibo Card (amiibo-mini-guide) - suggested category `villagers`, tags `villager`, `tips`.
- Celeste และดาวตก (celeste-guide) - suggested category `tips-and-tricks`, tags `event`, `tips`.

## Posts That Need Manual Review

- ACNH Beginner’s Guide: บทช่วยสอนตั้งแต่วันแรก (beginner-walkthrough-main) - ข้อมูลบางส่วนอยู่ในภาพและควรให้คนตรวจซ้ำก่อนใช้เป็นข้อมูลอ้างอิง 5 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 5, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: ภาพ 1 เพิ่มโครง timeline รายวัน เหมาะทำเป็น checklist/timeline บนเว็บ | ภาพ 2 เพิ่ม glossary ที่ควรทำเป็น structured cards | ภาพ 5 เพิ่มหัวข้อ hemisphere ที่ควรโยงกับ calendar/monthly guides
- สารบัญไกด์รายเดือน (monthly-checklist-index) - 1 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 1, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: เป็นภาพปก ไม่มีข้อมูลรายเดือนเพิ่มเติม
- สารบัญอีเวนต์และกิจกรรม (events-index) - 1 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 1, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: มีข้อความญี่ปุ่นบนภาพโปรโมต แต่ไม่ใช่ข้อมูลไกด์หลัก
- Seasonal Items จาก Nook Shopping และร้านค้า (seasonal-items-index) - 1 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 1, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: เป็นภาพปก ไม่มีข้อมูลรายการสินค้าเพิ่มเติม
- สารบัญการปลูกและทำสวน (gardening-index) - 1 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 1, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: เป็นภาพปก ไม่มีข้อมูล gardening เพิ่มเติม
- Blue Rose กุหลาบน้ำเงิน (blue-rose-guide) - ข้อมูลบางส่วนอยู่ในภาพและควรให้คนตรวจซ้ำก่อนใช้เป็นข้อมูลอ้างอิง 5 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 5, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: มีข้อมูล structured สำคัญในรูป โดยเฉพาะตารางเปรียบเทียบวิธีเพาะกุหลาบน้ำเงิน | ควรแปลงภาพ 3-5 เป็นตารางข้อมูลในเว็บ แต่อย่างน้อยหนึ่งรอบควรให้คนตรวจตัวเลขซ้ำ | ไม่พบ conflict กับข้อความโพสต์ในรอบนี้ แต่ข้อมูลตัวเลขยัง needsHumanReview
- Happy Home Paradise (happy-home-paradise-index) - 1 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 1, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว Image findings: เป็นภาพปก ไม่มีข้อมูล DLC เพิ่มเติม
- MeteoNook และการหาสภาพอากาศเกาะ (meteonook-weather) - ยังไม่มี image review แยกรายการ จึงควรตรวจภาพและความครบถ้วนก่อนนำเข้า จำนวนรูปที่พบ (6) ไม่ตรงกับ imageCount ใน curatedContent.ts (5),6 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 6, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว
- Brewster และ The Roost (brewster-guide) - ยังไม่มี image review แยกรายการ จึงควรตรวจภาพและความครบถ้วนก่อนนำเข้า จำนวนรูปที่พบ (6) ไม่ตรงกับ imageCount ใน curatedContent.ts (5),6 รูปในโพสต์หลัก, ดาวน์โหลดสำเร็จ 6, blocked 0,ข้อความโพสต์อยู่ใน postText แล้ว

## Posts That Include Images

- มารยาทสำคัญบนเกาะผู้อื่น (island-visitor-etiquette) - 1 image(s).
- NSO คืออะไรและทำอะไรได้บ้างใน ACNH (nso-benefits) - 3 image(s).
- ACNH Beginner’s Guide: บทช่วยสอนตั้งแต่วันแรก (beginner-walkthrough-main) - 5 image(s).
- หลังจบ 3 ดาวแล้วควรทำอะไรต่อ (after-three-stars-what-next) - 5 image(s).
- สารบัญไกด์รายเดือน (monthly-checklist-index) - 1 image(s).
- สารบัญอีเวนต์และกิจกรรม (events-index) - 1 image(s).
- Seasonal Items จาก Nook Shopping และร้านค้า (seasonal-items-index) - 1 image(s).
- สารบัญการปลูกและทำสวน (gardening-index) - 1 image(s).
- Blue Rose กุหลาบน้ำเงิน (blue-rose-guide) - 5 image(s).
- Happy Home Paradise (happy-home-paradise-index) - 1 image(s).
- การย้ายเกาะและย้ายข้อมูล Animal Crossing (island-transfer-overview) - 4 image(s).
- Amiibo Figures / Amiibo Card (amiibo-mini-guide) - 5 image(s).
- MeteoNook และการหาสภาพอากาศเกาะ (meteonook-weather) - 6 image(s).
- Celeste และดาวตก (celeste-guide) - 5 image(s).
- Brewster และ The Roost (brewster-guide) - 6 image(s).

## Candidate Matrix

| Slug | Suggested title | Category | Tags | Status | Confidence | Review needed | Images |
| --- | --- | --- | --- | --- | --- | --- | --- |
| island-visitor-etiquette | มารยาทสำคัญบนเกาะผู้อื่น | rules-and-important-info | beginner, tips, island, faq | draft | high | no | 1 |
| nso-benefits | NSO คืออะไรและทำอะไรได้บ้างใน ACNH | rules-and-important-info | beginner, tips | draft | high | no | 3 |
| beginner-walkthrough-main | ACNH Beginner’s Guide: บทช่วยสอนตั้งแต่วันแรก | beginner-guide | beginner, island | review_needed | medium | yes | 5 |
| after-three-stars-what-next | หลังจบ 3 ดาวแล้วควรทำอะไรต่อ | beginner-guide | beginner, tips, island | draft | high | no | 5 |
| monthly-checklist-index | สารบัญไกด์รายเดือน | news-and-updates | event, tips | review_needed | medium | yes | 1 |
| events-index | สารบัญอีเวนต์และกิจกรรม | news-and-updates | event | review_needed | medium | yes | 1 |
| seasonal-items-index | Seasonal Items จาก Nook Shopping และร้านค้า | item-info | item, event | review_needed | medium | yes | 1 |
| gardening-index | สารบัญการปลูกและทำสวน | island-design | tips, design, island | review_needed | medium | yes | 1 |
| blue-rose-guide | Blue Rose กุหลาบน้ำเงิน | island-design | tips, design | review_needed | medium | yes | 5 |
| happy-home-paradise-index | Happy Home Paradise | island-design | design, item | review_needed | medium | yes | 1 |
| island-transfer-overview | การย้ายเกาะและย้ายข้อมูล Animal Crossing | rules-and-important-info | beginner, faq | draft | high | no | 4 |
| amiibo-mini-guide | Amiibo Figures / Amiibo Card | villagers | villager, tips | draft | high | no | 5 |
| meteonook-weather | MeteoNook และการหาสภาพอากาศเกาะ | tips-and-tricks | tips, island | review_needed | medium | yes | 6 |
| celeste-guide | Celeste และดาวตก | tips-and-tricks | event, tips | draft | high | no | 5 |
| brewster-guide | Brewster และ The Roost | villagers | villager, tips | review_needed | medium | yes | 6 |

## Normalized JSON Output

Created `data/facebook-import-candidates.json` with 15 de-duplicated candidate posts. Each candidate preserves the Facebook source URL when available, uses existing category/tag slugs, keeps content in content blocks, and defaults to `draft` or `review_needed` instead of publishing automatically.

## Recommended Next Step

Review `data/facebook-import-candidates.json` manually, approve which candidates may become drafts in the app, then create a separate import command that copies approved images into `backend/uploads/imported-facebook` and inserts posts/content blocks idempotently without overwriting existing user-created data.
