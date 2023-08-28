const args = process.argv.slice(2);

const params = {};
for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (key.startsWith('--') && value) {
        params[key.slice(2)] = value;
    }
}
