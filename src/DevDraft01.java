/* package whatever; // don't place package name! */

/* Name of the class has to be "Main" only if the class is public. */
class MyClass
{
    public static void main (String[] args) throws java.lang.Exception
    {

        // parse data
//        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
//        String[] firstLineArray = br.readLine().split("\\s+");
//        int numberOfMinions = Integer.parseInt(firstLineArray[0]);
//        int firstSpellDamage = Integer.parseInt(firstLineArray[1]);
//        int damageReduction = Integer.parseInt(firstLineArray[2]);
//
//        String[] secondLineArray = br.readLine().split("\\s+");
//        int[] minionsHealth = new int[numberOfMinions];
//        for (int i = 0; i < minionsHealth.length; i++) {
//            minionsHealth[i] = Integer.parseInt(secondLineArray[i]);
//        }

        // test purpose only
        int numberOfMinions = 6;
        int firstSpellDamage = 200;
        int damageReduction = 45;
        int[] minionsHealth = new int[]{250, 100, 95, 90, 80, 60};

//        int numberOfMinions = 5;
//        int firstSpellDamage = 600;
//        int damageReduction = 200;
//        int[] minionsHealth = new int[]{500, 400, 325, 300, 250};

//        Arrays.sort(minionsHealth);

        int killedMinions = 0;
        int currentSpellDamage = firstSpellDamage;
//        for (int i = 0; i < minionsHealth.length; i++) {
//            int minionHealth = minionsHealth[i];
//            if (minionHealth <= currentSpellDamage) {
//                killedMinions++;
//                currentSpellDamage -= damageReduction;
//            }
//        }

        for (Integer minionHealth: minionsHealth) {
            if (minionHealth <= currentSpellDamage) {
                killedMinions++;
                currentSpellDamage -= damageReduction;
            }
        }
        System.out.println(killedMinions);
    }
}