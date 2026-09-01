const API_URL = import.meta.env.VITE_API_URL;

export const wakeServer = async () => {
    const maxAttempts = 10;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await fetch(`${API_URL}/api/health`);

            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.log(
                `Waiting for server... attempt ${attempt}/${maxAttempts}`
            );
        }

        if (attempt < maxAttempts) {
            await new Promise((resolve) =>
                setTimeout(resolve, retryDelay)
            );
        }
    }

    throw new Error("Unable to connect to server");
};