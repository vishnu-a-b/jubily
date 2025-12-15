import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// CLI tool to generate password hashes
if (require.main === module) {
  const passwords = [
    'operator1pass',
    'operator2pass',
    'operator3pass',
    'operator4pass',
    'operator5pass',
    'operator6pass',
    'adminpass'
  ];

  console.log('\n=== Password Hash Generator ===\n');

  Promise.all(passwords.map(async (password, index) => {
    const hash = await hashPassword(password);
    const username = index < 6 ? `operator${index + 1}` : 'admin';
    const role = index < 6 ? 'user' : 'admin';
    console.log(`USER_${index + 1}=${username}:${hash}:${role}`);
  })).then(() => {
    console.log('\nCopy these to your .env file\n');
  });
}
