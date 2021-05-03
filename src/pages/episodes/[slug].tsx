import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

import { GetStaticPaths, GetStaticProps } from "next";

import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";
import { usePlayer } from "../../contexts/PlayerContext";

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  url: string;
  duration: number;
  durationAsString: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episodeContainer}>
      <div className={styles.episode}>
        <Head>
          <title>{episode.title} | Podcastr</title>
        </Head>
        <div className={styles.thumbnailContainer}>
          <Link href="/">
            <button type="button">
              <img src="/arrow-left.svg" alt="Voltar" />
            </button>
          </Link>
          <Image
            width={700}
            height={160}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <button type="button" onClick={() => play(episode)}>
            <img src="/play.svg" alt="Tocar episódio" />
          </button>
        </div>

        <header>
          <h1>{episode.title}</h1>
          <span>{episode.members}</span>
          <span>{episode.publishedAt}</span>
          <span>{episode.durationAsString}</span>
        </header>

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      </div>
    </div>
  );
}

const episodesJson = require("../../../server.json");

export const getStaticPaths: GetStaticPaths = async () => {
  var latestEpisodes = [];
  for (let i = 0; i < 2; i++) {
    latestEpisodes.push(episodesJson.episodes[i]);
  }

  const paths = latestEpisodes.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const result = episodesJson.episodes.find((element) => element.id == slug);

  const episode = {
    id: result.id,
    title: result.title,
    thumbnail: result.thumbnail,
    members: result.members,
    publishedAt: format(parseISO(result.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(result.file.duration),
    durationAsString: convertDurationToTimeString(Number(result.file.duration)),
    description: result.description,
    url: result.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, //24 hours
  };
};
