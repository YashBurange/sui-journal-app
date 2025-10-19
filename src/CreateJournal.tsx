import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, TextField } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useState } from "react";

export function CreateJournal({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const journalPackageId = useNetworkVariable("journalPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [title, setTitle] = useState("");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function create() {
    if (!currentAccount) return;
    
    // Check if package ID is properly set
    if (!journalPackageId || journalPackageId === "0xTODO") {
      alert("Journal contract not deployed yet. Please deploy the journal contract first and update the package ID in constants.ts");
      return;
    }

    /**
     * Task 1:
     *
     * Create a new Transaction instance from the @mysten/sui/transactions module.
     */
    const tx = new Transaction();

    /**
     * Task 2: 
     * 
     * Execute a call to the `journal::new_journal` function to create a new journal. 
     * 
     * Make sure to use the title input from the user
     */
    const journal = tx.moveCall({
      target: `${journalPackageId}::journal::new_journal`,
      arguments: [tx.pure.string(title)],
    });

    /**
     * Task 3: 
     * 
     * Transfer the new Journal object to the connected user's address
     * 
     * Hint: use currentAccount.address to the user's address
     */
    tx.transferObjects([journal], currentAccount.address);

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          try {
            const { effects } = await suiClient.waitForTransaction({
              digest: digest,
              options: {
                showEffects: true,
              },
            });

            const journalId = effects?.created?.[0]?.reference?.objectId;
            if (journalId) {
              onCreated(journalId);
            } else {
              alert("Failed to get journal ID from transaction");
            }
          } catch (error) {
            console.error("Error waiting for transaction:", error);
            alert("Transaction completed but failed to get journal ID");
          }
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert(`Transaction failed: ${error.message || "Unknown error"}`);
        },
      },
    );
  }

  return (
    <Container>
      <TextField.Root
        placeholder="Enter journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        size="3"
        mb="3"
      />
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={isSuccess || isPending || !title.trim() || journalPackageId === "0xTODO"}
      >
        {isSuccess || isPending ? (
          <ClipLoader size={20} />
        ) : journalPackageId === "0xTODO" ? (
          "Deploy Contract First"
        ) : (
          "Create Journal"
        )}
      </Button>
    </Container>
  );
}
