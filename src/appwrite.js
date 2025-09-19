import { Client, Query, TablesDB } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // 1. user appwrite sdk to check if search term exists in db
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", searchTerm)],
    });

    // 2. if it does, update the count
    if (result.total > 0) {
      const row = result.rows[0];
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: { count: row.count + 1 },
      });
    }
    // 3. if it doesnot found, create new doc with the serach term and count as 1
    else {
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: "unique()",
        data: {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });

    return result.rows;
  } catch (err) {
    console.error(err);
  }
};
