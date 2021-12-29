/**
 * All client events should extend this base class.
 */
export default class Events {
    public constructor(...derive: any) {

        // Merge client parameters with "this" for ease of access.
        Object.mergify(this, ...derive)
    }
}
