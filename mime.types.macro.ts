let dict: Record<string, string> = {}

Object.entries(require('mime-db/db.json')).forEach(
  ([mime, { extensions }]: any) => {
    extensions?.forEach((ext: string) => {
      dict[ext] = mime
    })
  },
)
;`
export let ext_to_mime = ${JSON.stringify(dict, null, 2)}`
