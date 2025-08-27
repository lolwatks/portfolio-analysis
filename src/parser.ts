import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export interface Fund {
  scheme: string;
  units: number;
  nav: number;
  value: number;
  transactions: Transaction[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  units: number;
  nav: number;
  balance: number;
}

export interface ParsedData {
  folioNumber: string;
  funds: Fund[];
}

function transformCasparserData(data: any): { folioNumber: string; funds: any[] } {
  if (!data || !Array.isArray(data.folios)) {
    console.log('Invalid data structure:', data);
    return { folioNumber: "", funds: [] };
  }

  const transformedFunds = data.folios.flatMap((folio: any) => {
    return (folio.schemes || []).map((scheme: any) => {
      // Ensure all required fields exist
      if (!scheme || !scheme.valuation) {
        console.log('Invalid scheme data:', scheme);
        return null;
      }

      return {
        folioNumber: folio.folio || '',
        schemeName: scheme.scheme || 'Unknown Scheme',
        isin: scheme.isin || '',
        amfi: scheme.amfi || '', // Add AMFI code for MF API
        rta: scheme.rta || '',
        type: scheme.type || '',
        nav: Number(scheme.valuation.nav || 0),
        units: Number(scheme.close || 0),
        cost: Number(scheme.valuation.cost || 0),
        value: Number(scheme.valuation.value || 0),
        transactions: (scheme.transactions || []).map((txn: any) => ({
          date: txn.date || '',
          description: txn.description || '',
          amount: Number(txn.amount || 0),
          units: Number(txn.units || 0),
          nav: Number(txn.nav || 0),
          balance: Number(txn.balance || 0),
          type: txn.type || ''
        }))
      };
    }).filter(Boolean); // Remove null entries
  });

  const result = {
    folioNumber: data.folios[0]?.folio || "",
    funds: transformedFunds
  };

  return result;
}

export async function parseECAS(pdfBuffer: Buffer, password: string): Promise<ParsedData> {
  // Save PDF to a temporary file
  const tempFile = join(process.cwd(), 'temp.pdf');
  writeFileSync(tempFile, pdfBuffer);

  try {
    const result = await new Promise<ParsedData>((resolve, reject) => {
      console.log('Running casparser command...');
      const outputPath = join(process.cwd(), 'output.json');
      const casparser = spawn('casparser', [tempFile, '-p', password, '-o', outputPath]);
      let errorOutput = '';

      casparser.stderr.on('data', (data) => {
        const chunk = data.toString();
        console.log('Received stderr:', chunk);
        errorOutput += chunk;
      });

      casparser.on('close', (code) => {
        console.log('casparser process exited with code:', code);

        if (code !== 0) {
          reject(new Error(`casparser failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          // Read the output file
          const outputContent = readFileSync(outputPath, 'utf8');
          const rawData = JSON.parse(outputContent);
          
          // Transform the data into our expected format
          const transformedData = transformCasparserData(rawData);
          
          // Clean up the output file
          try {
            unlinkSync(outputPath);
          } catch (e) {
            // Ignore cleanup errors
            console.warn('Failed to clean up output file:', e);
          }

          resolve(transformedData);
        } catch (e) {
          console.error('JSON parse error:', e);
          reject(new Error(`Failed to parse casparser output: ${e instanceof Error ? e.message : String(e)}`));
        }
      });
    });

    return result;
  } finally {
    // Clean up temporary file
    try {
      unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
