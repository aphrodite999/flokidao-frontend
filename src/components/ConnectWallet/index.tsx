import {
    Button,
    Modal,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    ModalFooter,
    useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Web3 from 'web3'
import { useTypedSelector } from 'hooks/useTypeSelector';
import { useDispatch } from 'react-redux';
import { connectWallet } from 'redux/actionCreators';

const ConnectWallet = () => {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [currentAddr, setCurrentAddr] = useState("");
    const dispatch = useDispatch();

    const { wallet } = useTypedSelector((state) => state.wallet);
    useEffect(() => {
        console.log("connect");
        setCurrentAddr(wallet);
    }, [wallet]);

    const connect = async () => {
        const chainId = 97;
        const nodes = ['https://data-seed-prebsc-1-s1.binance.org:8545/'];
        if (window.ethereum) {
            const web3 = new Web3((window as any).ethereum)
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: `0x${chainId.toString(16)}`,
                            chainName: 'Smart Chain - Testnet',
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'bnb',
                                decimals: 18,
                            },
                            rpcUrls: nodes,
                            blockExplorerUrls: ['https://testnet.bscscan.com'],
                        },
                    ],
                })

                await (window as any).ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }],
                })
                let accounts = await (window as any).ethereum.request({ method: 'eth_accounts', })
                setCurrentAddr(accounts[0]);
                localStorage.setItem('disconnected', 'false');
                dispatch(connectWallet(accounts[0]));
                (window as any).ethereum.on('chainChanged', (chainId: any) => {
                    window.location.reload();
                });
                (window as any).ethereum.on('accountsChanged', (chainId: any) => {
                    window.location.reload();
                });
                return
            } catch (error) {
                toast({
                    variant: 'left-accent',
                    position: 'top-right',
                    title: '',
                    description: "An error to connect the metamask",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            }
        }
    }
    const connectMetamask = () => {
        if ((window as any).ethereum) {
            connect();
        } else {
            alert("Please install Metamask first");
        }
    }
    const connectWalletPressed = () => {
        connectMetamask();
    }

    const disconnectWalletPressed = async () => {
        localStorage.setItem('disconnected', 'true');
        window.location.reload();
    }

    return (
        <>{
            (currentAddr && currentAddr != "") && <Button onClick={onOpen} size="md" variant="solid" className="headerAction">
                {
                    String(currentAddr).substring(0, 6) +
                    "..." +
                    String(currentAddr).substring(38)
                }
            </Button>
        }
            {
                (!currentAddr || currentAddr == "") && <Button onClick={connectWalletPressed} size="md" variant="solid" className="headerAction">
                    Connect Wallet
                </Button>
            }
            <Modal size="sm" isOpen={isOpen} onClose={onClose} colorScheme="facebook">
                <ModalOverlay />
                <ModalContent className="contribute-modal">
                    <ModalHeader>Disconnect Wallet</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => disconnectWalletPressed()}>
                            Disconnect
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default ConnectWallet;