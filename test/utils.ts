import Wallet from "ethereumjs-wallet";

export function randomAddress(): string {
    return Wallet.generate().getChecksumAddressString();
}
