import { readdir } from 'node:fs/promises'
import { join } from 'path'
import langFiles from './../../public/lang/id-ID.json'

const jsPath: string = join('.', '..', '..', 'public', 'mods')

const views: string[] = await readdir(jsPath, {
  recursive: true
})

const jsFiles: string[] = views.filter((data: string): boolean => Bun.file(data).type === 'text/javascript;charset=utf-8')

for (const viewFile of jsFiles) {

  const file = Bun.file(join(jsPath, viewFile))
  const globalRegex: RegExp = /translate\(\s*'([^']+)'(?:,\s*\[(.*?)\])?\s*\)/g

  let text = await file.text()
  const matchedText = text.match(globalRegex)

  if (matchedText && matchedText.length > 0) {

    for (const t of matchedText) {
      let matchText: any = [ ...t.matchAll(/translate\(\s*'([^']+)'(?:,\s*\[(.*?)\])?\s*\)/g) ].map(match => match[1])
      if (matchText && matchText.length > 0) {
        matchText = matchText.map((m: any) => m in langFiles ? (langFiles as any)[m] : '').join(' ')
        if (matchText && matchText != '') {
          text = text.replace(t, `\`${matchText}\``)
        }
      }
    }
  }
  await Bun.write(file, text)
}

console.log('Success')