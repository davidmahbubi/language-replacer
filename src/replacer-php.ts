import { readdir } from 'node:fs/promises'
import { join } from 'path'
import langFiles from './../../public/lang/id-ID.json'

const viewsPath: string = join('.', '..', '..', 'resources', 'views')

const views: string[] = await readdir(viewsPath, {
  recursive: true
})

const viewFiles: string[] = views.filter((data: string): boolean => Bun.file(data).type === 'application/x-httpd-php')

for (const viewFile of viewFiles) {

  const file = Bun.file(join(viewsPath, viewFile))
  const globalRegex: RegExp = /\{\{ ___\('([^']+)'(?:, \[(.*?)\])?\) \}\}/g

  let text = await file.text()
  const matchedText = text.match(globalRegex)

  if (matchedText && matchedText.length > 0) {

    for (const t of matchedText) {
      let matchText: any = [ ...t.matchAll(/___\(['"]([^'"]+)['"]\)/g) ].map(match => match[1])
      if (matchText && matchText.length > 0) {
        matchText = matchText.map((m: any) => m in langFiles ? (langFiles as any)[m] : '').join(' ')
        if (matchText && matchText != '') {
          text = text.replace(t, matchText)
        }
      }
    }
  }
  await Bun.write(file, text)
  console.log('Success')
}