import basicSetup from '../wallet-setup/basic.setup';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask,metaMaskFixtures } from '@synthetixio/synpress/playwright';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

const { expect } = test

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("TSender");
});

test("should show airdrop form when connected, otherwise not", async ({page , context ,metamaskPage,extensionId}) =>{
    //check we see please connect wallet
    await page.goto('/');
    await expect(page.getByText(" please connect a wallet")).toBeVisible();

    const metamask = new MetaMask(context , metamaskPage, basicSetup.walletPassword , extensionId);
    await page.getByTestId('rk-connect-button').click();
      await page.getByTestId('rk-wallet-option-io.metamask').waitFor({
    state: 'visible',
    timeout: 30000
  });
  await page.getByTestId('rk-wallet-option-io.metamask').click();
  await metamask.connectToDapp()

    const customNetwork = {
    name: 'Anvil',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    symbol: 'ETH'
  }
  await metamask.addNetwork(customNetwork)

  await expect(page.getByText('Token Address')).toBeVisible();

// await page.getByRole('textbox', { name: '0x', exact: true }).fill(mockTokenAddress);
//   await page.getByRole('textbox', { name: '0x123..., 0x456...' }).fill(anvil2Address);
//   await page.getByRole('textbox', { name: '200, 300...' }).fill(oneAmount);
//   await expect(page.getByText('Token Name:Mock Token')).toBeVisible();
}) 

