async function myFunction() {
    try {
        let result1 = await function1();
        let result2 = await function2(result1);
        let result3 = await function3(result2);
        return result3;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function function1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(console.log("done! function 1")), 2000)

    });
}

async function function2(result) {
    return new Promise((resolve, reject) => {
        if (result === "done!") {
            setTimeout(() => resolve(console.log("done! function 2")), 2000)
            console.log(result);
        } else {
            reject(new Error("function2 failed"));
        }
    });
}

async function function3(result) {
    return new Promise((resolve, reject) => {
        if (result === "done! again") {
            setTimeout(() => resolve("done! again again"), 2000)
        } else {
            reject(new Error("function3 failed"));
        }
    });
}
