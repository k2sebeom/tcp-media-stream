
// Key value pair for stream Keys

const allowedKeys: object = {
    "abcdef": "dsadsadsa",
    "asdsad": "dwd1dsdsad"
};


export const isValidKey = (streamKey: string): string | null => {
    return allowedKeys[streamKey];
}
