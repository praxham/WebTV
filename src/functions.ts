import { toast } from "react-toastify";

export const execute = async (
  cliCommand: string,
  setIsLoading?: (val: boolean) => void,
) => {
  try {
    setIsLoading && setIsLoading(true);

    const response = await fetch("/api/execute-cli-command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cliCommand }),
    });

    const contentType = response.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      // 405 is returned by vercel because of serverless architecture
      if (response.status === 405) {
        throw new Error(
          "CLI Execution is disabled in the serverless preview environment. Please host locally to use this feature.",
        );
      }

      throw new Error(
        data?.message ||
          `Server failed with status: ${response.status} ${response.statusText}`,
      );
    }

    if (data && !data.success) {
      throw new Error(data.message || "Something went wrong on the server");
    }

    console.log("Command executed successfully!");
  } catch (error) {
    console.error("Frontend caught an error:", error);
    toast.error(error instanceof Error ? error.message : String(error));
  } finally {
    setIsLoading && setIsLoading(false);
  }
};
