export default interface Preload {
    params: { [key: string]: string }
}

export default class Preload {
    public constructor() {
        this.params = this.parse(process.argv)

    }

    private parse(args: string[]) {
        const raw: string = `${args.join(' ')} -`
        const matches: RegExpMatchArray | null = raw.match(/(-{1,})(.*?)(?= )(.*?)(?= -)/g)
        const result: { [key: string]: string } = {}
        matches?.map((arg: string) => {
            const key: string | void = arg.replace(/^(-{1,})/g, '')?.split(' ')?.shift()
            const value: string = arg.split(' ').slice(1).join(' ')
            if (key) result[key] = value
        })
        return result
    }
}
