import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.VITE_GOOGLE_PRIVATE_KEY;

console.log('Testing Google Sheets Connection...');
console.log('Sheet ID:', SHEET_ID);
console.log('Service Account Email:', GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('Private Key length:', GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.length : 'NOT SET');

async function testConnection() {
  try {
    if (!SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing environment variables');
    }

    console.log('\n📝 Initializing Google Spreadsheet...');
    
    console.log('🔐 Setting up JWT authentication...');
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

    console.log('📊 Loading spreadsheet info...');
    await doc.loadInfo();
    
    console.log('✅ Connected successfully!');
    console.log('📄 Spreadsheet title:', doc.title);
    console.log('📋 Number of sheets:', doc.sheetCount);
    
    // List all sheets
    console.log('\n📋 Available sheets:');
    Object.values(doc.sheetsByIndex).forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title}`);
    });

    // Check if Leaderboard sheet exists
    const leaderboardSheet = doc.sheetsByTitle['Leaderboard'];
    if (leaderboardSheet) {
      console.log('\n🏆 Leaderboard sheet found!');
      console.log('   Rows:', leaderboardSheet.rowCount);
      console.log('   Cols:', leaderboardSheet.columnCount);
    } else {
      console.log('\n⚠️ Leaderboard sheet not found. Creating one...');
      const newSheet = await doc.addSheet({
        title: 'Leaderboard',
        headerValues: ['Timestamp', 'Nickname', 'Stage', 'Time(seconds)', 'Accuracy', 'Date']
      });
      console.log('✅ Leaderboard sheet created!');
    }

    console.log('\n🎯 Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();